import { type NextRequest, NextResponse } from "next/server"
import { callGeminiAPI } from "@/lib/gemini"
import { getCreditsFromRDS, deductCreditsFromRDS } from "@/lib/aws/rds"
import { saveMessageToS3 } from "@/lib/aws/s3"
import { validateTokenWithCognito } from "@/lib/auth"

const IS_DEV_MODE = process.env.NODE_ENV === "development" && process.env.BYPASS_RDS === "true"

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory = [], chatId } = await request.json()

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.slice(7)

    let userId: string
    try {
      const userInfo = await validateTokenWithCognito(token)
      userId = userInfo.sub
      console.log("[API Chat] User authenticated:", userId)
    } catch (error) {
      console.error("[API Chat] Token validation failed:", error)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    let credits = 999 // Default for dev mode
    if (!IS_DEV_MODE) {
      credits = await getCreditsFromRDS(userId)
      if (credits <= 0) {
        return NextResponse.json({ error: "Insufficient credits. Please upgrade your plan." }, { status: 402 })
      }
      console.log(`[API Chat] User has ${credits} credits available`)
    } else {
      console.log("[API Chat] Development mode: Bypassing RDS validation")
    }

    const botResponse = await callGeminiAPI(message, conversationHistory)

    if (!IS_DEV_MODE) {
      const deducted = await deductCreditsFromRDS(userId, 1)
      if (!deducted) {
        console.error("[API Chat] Failed to deduct credits")
      }
    }

    const currentChatId = chatId || `chat-${Date.now()}`

    if (!IS_DEV_MODE) {
      Promise.all([
        saveMessageToS3(userId, currentChatId, {
          role: "user",
          content: message,
          timestamp: new Date().toISOString(),
        }),
        saveMessageToS3(userId, currentChatId, {
          role: "assistant",
          content: botResponse,
          timestamp: new Date().toISOString(),
        }),
      ]).catch((error) => {
        console.error("[API Chat] Failed to save to S3:", error)
      })
    }

    const remainingCredits = IS_DEV_MODE ? 999 : credits - 1

    return NextResponse.json({
      success: true,
      message: botResponse,
      chatId: currentChatId,
      creditsRemaining: remainingCredits,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[API Chat Error]:", error)
    const errorMessage = error instanceof Error ? error.message : "Error processing message"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
