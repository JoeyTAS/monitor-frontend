"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogPortal, DialogOverlay, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { SiteHealthChart } from "@/components/SiteHealthChart"
import { api, type Site } from "@/lib/api"
import { getToken, removeToken } from "@/lib/auth"

import {
  GlobeIcon,
  PlusIcon,
  ActivityLogIcon,
  ExclamationTriangleIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  LightningBoltIcon,
  EyeOpenIcon,
  ExitIcon,
} from "@radix-ui/react-icons"

import { SiteChart } from "./site-chart"

export function WebsiteMonitor() {
  const router = useRouter()

  const [sites, setSites] = useState<Site[]>([])
  const [newUrl, setNewUrl] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const [incidentLogs, setIncidentLogs] = useState<any[]>([])
  const [openGroups, setOpenGroups] = useState<{ [key: string]: boolean }>({})

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [siteToDelete, setSiteToDelete] = useState<Site | null>(null)

  const toggleGroup = (id: string) => {
    setOpenGroups(prev => ({ ...prev, [id]: !prev[id] }))
  }

  useEffect(() => {
    loadSites()
    loadIncidents()
  }, [])

  const loadSites = async () => {
    try {
      const token = getToken()
      if (!token) return router.push("/login")
      const data = await api.getSites(token)
      setSites(data)
      setError("")
    } catch (err) {
      setError("Error al cargar los sitios")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const loadIncidents = async () => {
    try {
      const token = getToken()
      if (!token) return
      const incidents = await api.getIncidentHistory(token)
      setIncidentLogs(incidents)
    } catch (err) {
      console.log("Error cargando incidentes", err)
    }
  }

  const handleAddSite = async () => {
    if (!newUrl || !newUrl.startsWith("http")) {
      setError("Por favor ingresa una URL válida")
      return
    }

    setIsScanning(true)
    setError("")
    try {
      const token = getToken()
      if (!token) return router.push("/login")
      const newSite = await api.addSite(token, newUrl)
      setSites(prev => [...prev, newSite])
      setNewUrl("")
    } catch (err) {
      setError("Error al agregar el sitio")
      console.error(err)
    } finally {
      setIsScanning(false)
    }
  }

  const handleDeleteSite = async () => {
    if (!siteToDelete) return
    try {
      const token = getToken()
      if (!token) return
      await api.deleteSite(token, siteToDelete.id) // ✅ id es string UUID
      setSites(prev => prev.filter(s => s.id !== siteToDelete.id))
      setSiteToDelete(null)
      setDeleteDialogOpen(false)
    } catch (err) {
      console.error("Error eliminando sitio", err)
      setError("Error eliminando sitio")
    }
  }

  const handleLogout = () => {
    removeToken()
    router.push("/login")
  }

  const getStatusIcon = (status: string | null) => {
    if (!status) return <ActivityLogIcon className="w-4 h-4 text-yellow-500" />
    switch (status) {
      case "online": return <CheckCircledIcon className="w-4 h-4 text-emerald-500" />
      case "offline": return <CrossCircledIcon className="w-4 h-4 text-red-500" />
      default: return <ActivityLogIcon className="w-4 h-4 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: string | null) => {
    if (!status) return <Badge className="bg-gray-100 text-gray-700 border">Verificando</Badge>
    return (
      <Badge className={status === "online" ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-red-100 text-red-700 border-red-200"}>
        {status === "online" ? "En línea" : "Fuera de línea"}
      </Badge>
    )
  }

  const onlineSites = sites.filter(s => s.latest_log?.status === "online").length
  const averageResponseTime = sites.length > 0 ? sites.reduce((acc, s) => acc + (s.latest_log?.response_time || 0), 0) / sites.length : 0

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><ActivityLogIcon className="h-8 w-8 animate-spin text-primary" /></div>

  const groupedIncidents = incidentLogs.reduce((acc, item) => {
    const key = item.site_id
    if (!acc[key]) acc[key] = { site_name: item.site_name, url: item.url, incidents: [] }
    acc[key].incidents.push(item)
    return acc
  }, {} as any)

  return (
    <div className="min-h-screen p-4 md:p-6 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10"><GlobeIcon className="w-6 h-6" /></div>
            <div>
              <h1 className="text-2xl font-bold">Monitor de Sitios Web</h1>
              <p className="text-muted-foreground">Consulta el estado, rendimiento e incidencias</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2"><ExitIcon />Cerrar sesión</Button>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="sites">Sitios Monitoreados</TabsTrigger>
            <TabsTrigger value="incidents">Historial de Incidencias</TabsTrigger>
          </TabsList>

          {/* General */}
          <TabsContent value="general" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 flex gap-3 items-center">
                  <div className="p-2 bg-blue-100 rounded-lg"><GlobeIcon /></div>
                  <div>
                    <p className="text-sm text-muted-foreground">Sitios Monitoreados</p>
                    <p className="text-2xl font-bold">{sites.length}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex gap-3 items-center">
                  <div className="p-2 bg-emerald-100 rounded-lg"><CheckCircledIcon /></div>
                  <div>
                    <p className="text-sm text-muted-foreground">En Línea</p>
                    <p className="text-2xl font-bold text-emerald-600">{onlineSites}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex gap-3 items-center">
                  <div className="p-2 bg-orange-100 rounded-lg"><LightningBoltIcon /></div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tiempo Promedio</p>
                    <p className="text-2xl font-bold">{Math.round(averageResponseTime)}ms</p>
                  </div>
                </CardContent>
              </Card>
            </div>
             <div className="mt-6">
    <SiteHealthChart sites={sites} />
  </div>
          </TabsContent>

          {/* Sites */}
          <TabsContent value="sites" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><PlusIcon />Agregar Nuevo Sitio</CardTitle>
                <CardDescription>Ingresa la URL del sitio web que deseas monitorear</CardDescription>
              </CardHeader>
              <CardContent>
                {error && <Alert variant="destructive" className="mb-4"><ExclamationTriangleIcon /><AlertDescription>{error}</AlertDescription></Alert>}
                <div className="flex gap-3">
                  <Input placeholder="https://ejemplo.com" value={newUrl} onChange={e => setNewUrl(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAddSite()} />
                  <Button onClick={handleAddSite} disabled={isScanning}>
                    {isScanning ? <><ActivityLogIcon className="animate-spin mr-2" />Añadiendo...</> : <><EyeOpenIcon className="mr-2" />Añadir</>}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sites.map(site => (
                <Card key={site.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(site.latest_log?.status || null)}
                        <CardTitle className="text-lg break-all">{site.name}</CardTitle>
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => { setSiteToDelete(site); setDeleteDialogOpen(true) }}>Eliminar</Button>
                    </div>
                    <CardDescription className="break-all text-xs">{site.url}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">Estado</span>{getStatusBadge(site.latest_log?.status || null)}</div>
                    {site.latest_log ? (
                      <>
                        <div className="flex justify-between"><span className="text-sm text-muted-foreground">Tiempo de respuesta:</span><span className="text-sm font-medium">{site.latest_log.response_time}ms</span></div>
                        <div className="flex justify-between"><span className="text-sm text-muted-foreground">Última verificación:</span><span className="text-sm font-medium">{new Date(site.latest_log.timestamp).toLocaleTimeString()}</span></div>
                      </>
                    ) : (<p className="text-sm italic text-muted-foreground">Esperando primer escaneo...</p>)}
                    <SiteChart siteId={site.id} siteName={site.name} />
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Incidents */}
          <TabsContent value="incidents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><ExclamationTriangleIcon />Incidencias registradas</CardTitle>
                <CardDescription>Fallas detectadas (sitios fuera de línea)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {incidentLogs.length === 0 && <p className="text-sm text-muted-foreground">No hay incidentes registrados.</p>}
                {Object.values(groupedIncidents).map((group: any) => {
                  const isOpen = openGroups[group.url] ?? true
                  return (
                    <div key={group.url} className="border p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <button onClick={() => toggleGroup(group.url)} className="flex items-center gap-2 font-bold">{isOpen ? "▼" : "▶"} {group.site_name}</button>
                        <Badge className="bg-red-100 text-red-700 border-red-300">{group.incidents.length} incidentes</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground break-all">{group.url}</p>
                      {isOpen && <div className="pl-3 mt-2 space-y-1 text-sm text-muted-foreground">{group.incidents.map((log: any) => (<div key={log.id}>• {new Date(log.timestamp).toLocaleString()}</div>))}</div>}
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogPortal>
            <DialogOverlay />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Eliminar Sitio</DialogTitle>
              </DialogHeader>
              <DialogDescription>
                ¿Seguro que deseas eliminar el sitio <strong>{siteToDelete?.name}</strong>? Esta acción no se puede deshacer.
              </DialogDescription>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
                <Button variant="destructive" onClick={handleDeleteSite}>Eliminar</Button>
              </DialogFooter>
            </DialogContent>
          </DialogPortal>
        </Dialog>
      </div>
    </div>
  )
}
