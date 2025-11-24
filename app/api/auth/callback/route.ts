import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://10.0.2.93:8000'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      )
    }

    console.log('[Frontend API] Calling backend auth/callback with code')

    // Llamar al backend Express desde el servidor de Next.js
    const response = await fetch(
      `${BACKEND_URL}/api/auth/callback?code=${encodeURIComponent(code)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error('[Frontend API] Backend auth error:', data)
      return NextResponse.json(data, { status: response.status })
    }

    console.log('[Frontend API] Auth successful')
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('[Frontend API] Auth callback error:', error)
    return NextResponse.json(
      { error: 'Failed to authenticate', details: error.message },
      { status: 500 }
    )
  }
}
