import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL || "http://10.0.2.93:8000"

export async function GET(req: NextRequest) {
  try {
    console.log("[Frontend API] Fetching credits from backend...")
    const token = req.headers.get("authorization")
    
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const response = await fetch(`${BACKEND_URL}/api/credits`, {
      headers: {
        Authorization: token,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      console.log("[Frontend API] Credits fetch error:", error)
      return NextResponse.json(error, { status: response.status })
    }

    const data = await response.json()
    console.log("[Frontend API] Credits fetched successfully:", data)
    return NextResponse.json(data)
  } catch (error) {
    console.error("[Frontend API] Credits fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch credits" }, { status: 500 })
  }
}
