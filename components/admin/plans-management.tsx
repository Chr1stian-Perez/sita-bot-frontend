"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Plan {
  id: number
  name: string
  credits: number
  price: string
  description: string
  is_active: boolean
}

export function PlansManagement() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [editingPlanId, setEditingPlanId] = useState<number | null>(null)
  const [formData, setFormData] = useState({ name: "", credits: "", price: "", description: "" })

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem("access_token")
      
      const response = await fetch("/api/admin/plans", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log("Plans data:", data)
        setPlans(data.plans)
      }
    } catch (error) {
      console.error("Error fetching plans:", error)
    } finally {
      setLoading(false)
    }
  }

  const updatePlan = async (planId: number) => {
    try {
      const response = await fetch(`/api/admin/plans/${planId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          credits: parseInt(formData.credits),
          price: parseFloat(formData.price),
          description: formData.description,
        }),
      })

      if (response.ok) {
        fetchPlans()
        setEditingPlanId(null)
      }
    } catch (error) {
      console.error("Error updating plan:", error)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Cargando planes...</div>
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Gestión de Planes de Suscripción</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Créditos</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map((plan) => (
              <TableRow key={plan.id}>
                {editingPlanId === plan.id ? (
                  <>
                    <TableCell>
                      <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={formData.credits}
                        onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => updatePlan(plan.id)}>
                          Guardar
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingPlanId(null)}>
                          Cancelar
                        </Button>
                      </div>
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell>{plan.name}</TableCell>
                    <TableCell>{plan.credits}</TableCell>
                    <TableCell>${plan.price}</TableCell>
                    <TableCell>{plan.description}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingPlanId(plan.id)
                          setFormData({
                            name: plan.name,
                            credits: plan.credits.toString(),
                            price: plan.price,
                            description: plan.description,
                          })
                        }}
                      >
                        Editar
                      </Button>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
