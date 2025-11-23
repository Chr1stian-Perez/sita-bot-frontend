import { type NextRequest, NextResponse } from "next/server"
import { validateTokenWithCognito } from "@/lib/auth"
import { saveChatHistoryToS3 } from "@/lib/aws/s3"

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.replace("Bearer ", "")
    const userData = await validateTokenWithCognito(token)

    if (!userData?.sub) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { chatId, messages } = await req.json()

    if (!chatId || !messages) {
      return NextResponse.json({ error: "chatId and messages are required" }, { status: 400 })
    }

    console.log(`[API] Saving chat ${chatId} for user ${userData.sub}`)

    await saveChatHistoryToS3({
      userId: userData.sub,
      chatId,
      messages,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[API Save Chat Error]:", error)
    return NextResponse.json({ error: "Failed to save chat" }, { status: 500 })
  }
}
