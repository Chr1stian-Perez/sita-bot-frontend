import { type NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL || "http://10.0.2.93:8000"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params
    const token = req.headers.get("authorization")
    const body = await req.json()

    const response = await fetch(`${BACKEND_URL}/api/admin/users/${userId}/credits`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: token || "",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error("Failed to update user credits")
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[Admin User Credits] Error:", error)
    return NextResponse.json({ error: "Failed to update user credits" }, { status: 500 })
  }
}
