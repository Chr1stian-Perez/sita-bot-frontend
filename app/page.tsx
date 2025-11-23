import type { Metadata } from "next"
import ClientPage from "./client-page"

export const metadata: Metadata = {
  title: "SITA Bot - Asistente inteligente",
  description: "Asistente inteligente con servicios AWS",
}

export default function Page() {
  return <ClientPage />
}
