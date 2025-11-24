import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://10.0.2.93:8000'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      return NextResponse.json(
        { error: 'No authorization header' },
        { status: 401 }
      )
    }

    console.log('[Frontend API] Fetching chats from backend...')

    const response = await fetch(`${BACKEND_URL}/api/chats`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('[Frontend API] Chats fetch error:', data)
      return NextResponse.json(data, { status: response.status })
    }

    console.log('[Frontend API] Chats fetched successfully')
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('[Frontend API] Chats fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chats', details: error.message },
      { status: 500 }
    )
  }
}
