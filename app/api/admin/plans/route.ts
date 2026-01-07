import { NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL || "http://10.0.2.93:8000"

export async function GET(request: Request) {
  try {
    const token = request.headers.get("authorization")

    const response = await fetch(`${BACKEND_URL}/api/admin/plans`, {
      headers: {
        Authorization: token || "",
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch plans" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[API] Plans error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
