import { NextRequest, NextResponse } from "next/server"
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda"

const lambdaClient = new LambdaClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const PLAN_CREDITS = {
  pro: 1000,
  premium: 10000,
}

export async function POST(req: NextRequest) {
  try {
    console.log("[Frontend API] Upgrading subscription...")
    
    const token = req.headers.get("authorization")
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const body = await req.json()
    const { planType } = body
    console.log("[Frontend API] Upgrade request body:", body)

    // Extraer userId del token JWT
    const tokenParts = token.replace("Bearer ", "").split(".")
    if (tokenParts.length !== 3) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }
    
    const payload = JSON.parse(Buffer.from(tokenParts[1], "base64").toString())
    const userId = payload.sub || payload["cognito:username"]
    
    if (!userId) {
      return NextResponse.json({ error: "Invalid token payload" }, { status: 401 })
    }

    console.log("[Frontend API] Upgrade request - User:", userId, "Plan:", planType)

    const creditsToAdd = PLAN_CREDITS[planType as keyof typeof PLAN_CREDITS] || 2000
    console.log("[Frontend API] Adding credits:", creditsToAdd)

    // Invocar Lambda directamente
    const lambdaPayload = {
      detail: {
        userId,
        creditsToAdd,
      },
    }

    console.log("[Frontend API] Invoking Lambda with payload:", lambdaPayload)

    const command = new InvokeCommand({
      FunctionName: "actualizar-usuario",
      Payload: JSON.stringify(lambdaPayload),
    })

    const response = await lambdaClient.send(command)
    const result = JSON.parse(new TextDecoder().decode(response.Payload))

    console.log("[Frontend API] Lambda response:", result)

    if (result.statusCode !== 200) {
      return NextResponse.json(
        { error: "Failed to update credits", details: result },
        { status: result.statusCode }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Créditos actualizados exitosamente",
      credits: JSON.parse(result.body).credits,
    })
  } catch (error) {
    console.error("[Frontend API] Upgrade error:", error)
    return NextResponse.json(
      { error: "Failed to upgrade subscription", details: String(error) },
      { status: 500 }
    )
  }
}
