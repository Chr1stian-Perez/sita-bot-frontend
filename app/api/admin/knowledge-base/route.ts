import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://10.0.2.93:8000"
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")
    
    const response = await fetch(`${BACKEND_URL}/api/admin/knowledge-base`, {
      headers: { Authorization: token || "" },
    })
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 })
  }
}
