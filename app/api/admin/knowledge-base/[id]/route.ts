import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://10.0.2.93:8000"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const token = request.headers.get("authorization")
    
    const response = await fetch(`${BACKEND_URL}/api/admin/knowledge-base/${id}`, {
      method: "DELETE",
      headers: { Authorization: token || "" },
    })
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 })
  }
}
