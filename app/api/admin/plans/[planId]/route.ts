import { NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL || "http://10.0.2.93:8000"

export async function PUT(request: Request, { params }: { params: { planId: string } }) {
  try {
    const token = request.headers.get("authorization")
    const body = await request.json()

    const response = await fetch(`${BACKEND_URL}/api/admin/plans/${params.planId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: token || "",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to update plan" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[API] Update plan error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
