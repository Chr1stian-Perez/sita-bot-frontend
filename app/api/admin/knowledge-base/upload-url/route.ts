import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://10.0.2.93:8000"

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")
    const body = await request.json()
    
    const response = await fetch(`${BACKEND_URL}/api/admin/knowledge-base/upload-url`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token || "",
      },
      body: JSON.stringify(body),
    })
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 })
  }
}
