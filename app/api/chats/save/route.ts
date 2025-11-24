import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://10.0.2.93:8000'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      return NextResponse.json(
        { error: 'No authorization header' },
        { status: 401 }
      )
    }

    console.log('[Frontend API] Saving chat to backend...')

    const response = await fetch(`${BACKEND_URL}/api/chats/save`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('[Frontend API] Chat save error:', data)
      return NextResponse.json(data, { status: response.status })
    }

    console.log('[Frontend API] Chat saved successfully')
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('[Frontend API] Chat save error:', error)
    return NextResponse.json(
      { error: 'Failed to save chat', details: error.message },
      { status: 500 }
    )
  }
}
