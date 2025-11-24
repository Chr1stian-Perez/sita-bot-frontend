import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://10.0.2.93:8000'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      return NextResponse.json(
        { error: 'No authorization header' },
        { status: 401 }
      )
    }

    console.log('[Frontend API] Validating token with backend')

    // Llamar al backend Express desde el servidor de Next.js
    const response = await fetch(`${BACKEND_URL}/api/auth/validate`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('[Frontend API] Token validation error:', data)
      return NextResponse.json(data, { status: response.status })
    }

    console.log('[Frontend API] Token validated successfully')
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('[Frontend API] Validate error:', error)
    return NextResponse.json(
      { error: 'Failed to validate token', details: error.message },
      { status: 500 }
    )
  }
}
