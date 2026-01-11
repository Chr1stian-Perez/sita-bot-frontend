"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardOverview } from "./dashboard-overview"
import { UsersManagement } from "./users-management"
import { SystemLogs } from "./system-logs"
import { KnowledgeBaseManagement } from "./knowledge-base-management"
import { Button } from "@/components/ui/button"
import { Shield, Users, FileText, LogOut, LayoutDashboard, BookOpen } from "lucide-react"
import { useRouter } from "next/navigation"

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const router = useRouter()

  const handleLogout = () => {
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Panel de Administrador</h1>
              <p className="text-sm text-muted-foreground">Sistema SITA Bot</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Volver al Chat
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="dashboard" className="gap-2">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Métricas</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Usuarios</span>
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Base de Conocimiento</span>
            </TabsTrigger>
            <TabsTrigger value="logs" className="gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Logs</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <DashboardOverview />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <UsersManagement />
          </TabsContent>

          <TabsContent value="knowledge" className="space-y-6">
            <KnowledgeBaseManagement />
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <SystemLogs />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
