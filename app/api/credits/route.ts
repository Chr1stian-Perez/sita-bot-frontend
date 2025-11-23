import { type NextRequest, NextResponse } from "next/server"
import { getUserCreditsInfo } from "@/lib/aws/rds"
import { validateTokenWithCognito } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.slice(7)

    let userId: string
    try {
      const userInfo = await validateTokenWithCognito(token)
      userId = userInfo.sub
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const creditsInfo = await getUserCreditsInfo(userId)

    if (!creditsInfo) {
      return NextResponse.json({
        credits: 0,
        totalMessages: 0,
      })
    }

    return NextResponse.json({
      credits: creditsInfo.credits,
      totalMessages: creditsInfo.total_messages,
      userId: creditsInfo.user_id,
    })
  } catch (error) {
    console.error("[Credits API Error]:", error)
    return NextResponse.json({ error: "Error fetching credits" }, { status: 500 })
  }
}
