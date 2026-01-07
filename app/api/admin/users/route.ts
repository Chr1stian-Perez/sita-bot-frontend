import { NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL || "http://10.0.2.93:8000"

export async function GET(request: Request) {
  try {
    const token = request.headers.get("authorization")
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get("limit") || "100"
    const offset = searchParams.get("offset") || "0"

    const response = await fetch(`${BACKEND_URL}/api/admin/users?limit=${limit}&offset=${offset}`, {
      headers: {
        Authorization: token || "",
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch users" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[API] Users error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
