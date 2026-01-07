"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Log {
  id: number
  level: string
  message: string
  user_id: string | null
  created_at: string
}

export function SystemLogs() {
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem("access_token")
      
      const response = await fetch("/api/admin/logs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log("Logs data:", data)
        setLogs(data.logs)
      }
    } catch (error) {
      console.error("Error fetching logs:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Cargando logs...</div>
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Logs del Sistema</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Nivel</TableHead>
              <TableHead>Mensaje</TableHead>
              <TableHead>User ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      log.level === "ERROR" ? "bg-red-500" : log.level === "WARN" ? "bg-yellow-500" : "bg-blue-500"
                    }`}
                  >
                    {log.level}
                  </span>
                </TableCell>
                <TableCell>{log.message}</TableCell>
                <TableCell className="font-mono text-xs">
                  {log.user_id ? log.user_id.substring(0, 20) + "..." : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
