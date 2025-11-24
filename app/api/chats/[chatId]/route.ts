import { type NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL || "http://10.0.2.93:8000"

export async function GET(request: NextRequest, { params }: { params: { chatId: string } }) {
  try {
    const authHeader = request.headers.get("authorization")
    const chatId = params.chatId

    if (!authHeader) {
      return NextResponse.json({ error: "No authorization header" }, { status: 401 })
    }

    console.log(`[Frontend API] Fetching chat ${chatId} from backend...`)

    const response = await fetch(`${BACKEND_URL}/api/chats/${chatId}`, {
      method: "GET",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("[Frontend API] Chat fetch error:", data)
      return NextResponse.json(data, { status: response.status })
    }

    console.log("[Frontend API] Chat fetched successfully")
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("[Frontend API] Chat fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch chat", details: error.message }, { status: 500 })
  }
}
