"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface User {
  user_id: string
  credits: number
  created_at: string
}

export function UsersManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [newCredits, setNewCredits] = useState("")

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("access_token")
      console.log("[v0] Fetching users with token:", !!token)
      
      const response = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      
      console.log("[v0] Users response status:", response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Users data:", data)
        console.log("[v0] First user:", data.users?.[0]) // <-- AGREGAR ESTA LÍNEA
        setUsers(data.users)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateCredits = async (userId: string) => {
    try {
      const token = localStorage.getItem("access_token")

      const response = await fetch(`/api/admin/users/${userId}/credits`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ credits: Number.parseInt(newCredits) }),
      })

      if (response.ok) {
        fetchUsers()
        setEditingUserId(null)
        setNewCredits("")
      } else {
        console.error("Error updating credits:", await response.text())
      }
    } catch (error) {
      console.error("Error updating credits:", error)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Cargando usuarios...</div>
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Gestión de Usuarios</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead>Créditos</TableHead>
              <TableHead>Fecha Registro</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.user_id}>
                <TableCell className="font-mono text-xs">{user.user_id.substring(0, 20)}...</TableCell>
                <TableCell>{user.credits}</TableCell>
                <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  {editingUserId === user.user_id ? (
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={newCredits}
                        onChange={(e) => setNewCredits(e.target.value)}
                        className="w-24"
                        placeholder={user.credits.toString()}
                      />
                      <Button size="sm" onClick={() => updateCredits(user.user_id)}>
                        Guardar
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingUserId(null)}>
                        Cancelar
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingUserId(user.user_id)
                        setNewCredits(user.credits.toString())
                      }}
                    >
                      Editar Créditos
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
