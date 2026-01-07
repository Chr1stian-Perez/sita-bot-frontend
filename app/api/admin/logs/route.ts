import { NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL || "http://10.0.2.93:8000"

export async function GET(request: Request) {
  try {
    const token = request.headers.get("authorization")
    const { searchParams } = new URL(request.url)
    const level = searchParams.get("level") || ""
    const limit = searchParams.get("limit") || "100"

    const url = level
      ? `${BACKEND_URL}/api/admin/logs?level=${level}&limit=${limit}`
      : `${BACKEND_URL}/api/admin/logs?limit=${limit}`

    const response = await fetch(url, {
      headers: {
        Authorization: token || "",
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch logs" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[API] Logs error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
