import { type NextRequest, NextResponse } from "next/server"
import { publishUpgradeEvent } from "@/lib/aws/eventbridge"
import { validateTokenWithCognito } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { planType } = await request.json()

    if (!["basic", "pro", "enterprise"].includes(planType)) {
      return NextResponse.json({ error: "Invalid plan type" }, { status: 400 })
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
      console.log("[Subscription] User requesting upgrade:", userId)
    } catch (error) {
      console.error("[Subscription] Token validation failed:", error)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const creditsMap = {
      basic: 1000,
      pro: 5000,
      enterprise: 20000,
    }
    const creditsToAdd = creditsMap[planType as keyof typeof creditsMap]

    try {
      const eventResult = await publishUpgradeEvent({
        userId,
        planType,
        creditsToAdd,
        timestamp: new Date().toISOString(),
      })

      console.log("[Subscription] Event published successfully:", eventResult.eventId)

      return NextResponse.json({
        success: true,
        message: `Plan upgrade to ${planType} initiated. Your credits will be updated shortly.`,
        eventId: eventResult.eventId,
        creditsToAdd,
      })
    } catch (eventError) {
      console.error("[Subscription EventBridge Error]:", eventError)
      return NextResponse.json({ error: "Failed to process upgrade request" }, { status: 500 })
    }
  } catch (error) {
    console.error("[Subscription Upgrade Error]:", error)
    return NextResponse.json({ error: "Error processing upgrade" }, { status: 500 })
  }
}
