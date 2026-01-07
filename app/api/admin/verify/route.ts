import { NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL || "http://10.0.2.93:8000"

export async function POST(request: Request) {
  try {
    // Obtener token del header Authorization
    let token = request.headers.get("authorization")
    
    // Si no viene en Authorization, intentar obtenerlo del body
    if (!token) {
      try {
        const body = await request.json()
        token = body.token
      } catch (e) {
        // No hay body
      }
    }

    console.log("[API] Admin verify - Token exists:", !!token)

    const response = await fetch(`${BACKEND_URL}/api/admin/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}` } : {}),
      },
    })

    const data = await response.json()
    console.log("[API] Admin verify response:", data)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error("[API] Admin verify error:", error)
    return NextResponse.json({ isAdmin: false, role: null }, { status: 500 })
  }
}
