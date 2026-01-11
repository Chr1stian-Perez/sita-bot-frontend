"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Upload, Trash2 } from "lucide-react"

interface Document {
  id: number
  title: string
  document_type: string
  category: string
  created_at: string
}

export function KnowledgeBaseManagement() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem("access_token")
      const response = await fetch("/api/admin/knowledge-base", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setDocuments(data.documents)
      }
    } catch (error) {
      console.error("Error fetching documents:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      const token = localStorage.getItem("access_token")

      // Obtener URL firmada
      const urlResponse = await fetch("/api/admin/knowledge-base/upload-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
        }),
      })

      const { uploadUrl } = await urlResponse.json()

      // Subir archivo a S3
      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      })

      alert("Documento subido exitosamente. Se procesará en unos momentos.")
      
      // Recargar lista después de 3 segundos
      setTimeout(() => fetchDocuments(), 3000)
    } catch (error) {
      console.error("Error uploading file:", error)
      alert("Error al subir el documento")
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("¿Está seguro de eliminar este documento?")) return

    try {
      const token = localStorage.getItem("access_token")
      await fetch(`/api/admin/knowledge-base/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchDocuments()
    } catch (error) {
      console.error("Error deleting document:", error)
    }
  }

  if (loading) return <div>Cargando...</div>

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Base de Conocimiento</h2>
        <div className="flex items-center gap-4">
          <Input
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileUpload}
            disabled={uploading}
            className="max-w-md"
          />
          {uploading && <span className="text-sm text-muted-foreground">Subiendo...</span>}
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Formatos soportados: PDF, Word (.doc, .docx), Texto (.txt)
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow key={doc.id}>
              <TableCell>{doc.title}</TableCell>
              <TableCell className="capitalize">{doc.document_type}</TableCell>
              <TableCell className="capitalize">{doc.category}</TableCell>
              <TableCell>{new Date(doc.created_at).toLocaleDateString()}</TableCell>
              <TableCell>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(doc.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
