import { type NextRequest, NextResponse } from "next/server"
import { validateTokenWithCognito } from "@/lib/auth"
import { loadChatHistoryFromS3, getChatFromS3 } from "@/lib/aws/s3"

export async function GET(req: NextRequest) {
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

    console.log("[API] Loading chats for user:", userData.sub)

    const chatIds = await loadChatHistoryFromS3(userData.sub)

    const chats = await Promise.all(
      chatIds.map(async (chatId) => {
        const messages = await getChatFromS3(userData.sub, chatId)
        return {
          id: chatId,
          title: messages?.[0]?.content.substring(0, 30) || "Nuevo Chat",
          messages: messages || [],
          createdAt: new Date(),
          userId: userData.sub,
        }
      }),
    )

    return NextResponse.json({ chats })
  } catch (error) {
    console.error("[API Chats Error]:", error)
    return NextResponse.json({ error: "Failed to load chats" }, { status: 500 })
  }
}
