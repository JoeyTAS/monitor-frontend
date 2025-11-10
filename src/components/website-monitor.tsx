"use client"

import { useState, useEffect, type HTMLAttributes } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { api, type Site } from "@/lib/api"
import { getToken, removeToken } from "@/lib/auth"
import { SiteChart } from "./site-chart"

const Globe = (props: HTMLAttributes<HTMLSpanElement>) => (
  <span {...props} className={`text-lg ${props.className ?? ""}`}>
    🌐
  </span>
)
const Plus = (props: HTMLAttributes<HTMLSpanElement>) => (
  <span {...props} className={`text-lg ${props.className ?? ""}`}>
    ➕
  </span>
)
const Activity = (props: HTMLAttributes<HTMLSpanElement>) => (
  <span {...props} className={`text-lg ${props.className ?? ""}`}>
    📊
  </span>
)
const AlertTriangle = (props: HTMLAttributes<HTMLSpanElement>) => (
  <span {...props} className={`text-lg ${props.className ?? ""}`}>
    ⚠️
  </span>
)
const CheckCircle = (props: HTMLAttributes<HTMLSpanElement>) => (
  <span {...props} className={`text-lg ${props.className ?? ""}`}>
    ✅
  </span>
)
const XCircle = (props: HTMLAttributes<HTMLSpanElement>) => (
  <span {...props} className={`text-lg ${props.className ?? ""}`}>
    ❌
  </span>
)
const Zap = (props: HTMLAttributes<HTMLSpanElement>) => (
  <span {...props} className={`text-lg ${props.className ?? ""}`}>
    ⚡
  </span>
)
const Eye = (props: HTMLAttributes<HTMLSpanElement>) => (
  <span {...props} className={`text-lg ${props.className ?? ""}`}>
    👁️
  </span>
)
const LogOut = (props: HTMLAttributes<HTMLSpanElement>) => (
  <span {...props} className={`text-lg ${props.className ?? ""}`}>
    🚪
  </span>
)

export function WebsiteMonitor() {
  const router = useRouter()
  const [sites, setSites] = useState<Site[]>([])
  const [newUrl, setNewUrl] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    loadSites()
  }, [])

  const loadSites = async () => {
    try {
      const token = getToken()
      if (!token) {
        router.push("/login")
        return
      }

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

  const handleAddSite = async () => {
    if (!newUrl || !newUrl.startsWith("http")) {
      setError("Por favor ingresa una URL válida")
      return
    }

    setIsScanning(true)
    setError("")

    try {
      const token = getToken()
      if (!token) {
        router.push("/login")
        return
      }

      const newSite = await api.addSite(token, newUrl)
      setSites((prev) => [...prev, newSite])
      setNewUrl("")
    } catch (err) {
      setError("Error al agregar el sitio")
      console.error(err)
    } finally {
      setIsScanning(false)
    }
  }

  const handleLogout = () => {
    removeToken()
    router.push("/login")
  }

  const getStatusIcon = (status: string | null) => {
    if (!status) return <Activity className="h-4 w-4 text-yellow-500" />
    switch (status) {
      case "online":
        return <CheckCircle className="h-4 w-4 text-emerald-500" />
      case "offline":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: string | null) => {
    if (!status) {
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
          Verificando
        </Badge>
      )
    }
    const variants = {
      online: "bg-emerald-100 text-emerald-800 border-emerald-200",
      offline: "bg-red-100 text-red-800 border-red-200",
    }

    return (
      <Badge variant="outline" className={variants[status as keyof typeof variants] || "bg-gray-100"}>
        {status === "online" ? "En línea" : status === "offline" ? "Fuera de línea" : "Verificando"}
      </Badge>
    )
  }

  const onlineSites = sites.filter((site) => site.latest_log?.status === "online").length
  const averageResponseTime =
    sites.length > 0 ? sites.reduce((acc, site) => acc + (site.latest_log?.response_time || 0), 0) / sites.length : 0

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Activity className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Globe />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Monitor de Sitios Web</h1>
              <p className="text-muted-foreground">
                Monitorea el estado y rendimiento de tus sitios web en tiempo real
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2 bg-transparent">
            <LogOut />
            Cerrar sesión
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Globe />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sitios Monitoreados</p>
                  <p className="text-2xl font-bold">{sites.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <CheckCircle />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">En Línea</p>
                  <p className="text-2xl font-bold text-emerald-600">{onlineSites}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Zap />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tiempo Respuesta Prom.</p>
                  <p className="text-2xl font-bold">{Math.round(averageResponseTime)}ms</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add New Site */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus />
              Agregar Nuevo Sitio
            </CardTitle>
            <CardDescription>Ingresa la URL del sitio web que deseas monitorear</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="flex gap-3">
              <Input
                placeholder="https://ejemplo.com"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddSite()}
                className="flex-1"
              />
              <Button onClick={handleAddSite} disabled={!newUrl || isScanning} className="min-w-[120px]">
                {isScanning ? (
                  <>
                    <Activity className="h-4 w-4 mr-2 animate-spin" />
                    Añadiendo...
                  </>
                ) : (
                  <>
                    <Eye />
                    Añadir
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sites Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sites.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="p-8 text-center">
                <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No hay sitios registrados. ¡Agrega uno para empezar!</p>
              </CardContent>
            </Card>
          ) : (
            sites.map((site) => (
              <Card key={site.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {site.latest_log && getStatusIcon(site.latest_log.status)}
                      <CardTitle className="text-lg break-all">{site.name}</CardTitle>
                    </div>
                  </div>
                  <CardDescription className="break-all text-xs">{site.url}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Estado:</span>
                    {site.latest_log ? (
                      getStatusBadge(site.latest_log.status)
                    ) : (
                      <Badge variant="outline" className="bg-gray-100">
                        Sin datos
                      </Badge>
                    )}
                  </div>

                  {site.latest_log ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Tiempo de respuesta:</span>
                        <span className="text-sm font-medium">{site.latest_log.response_time}ms</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Última verificación:</span>
                        <span className="text-sm font-medium">
                          {new Date(site.latest_log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-muted-foreground italic">Esperando primer escaneo...</div>
                  )}

                  <SiteChart siteId={site.id} siteName={site.name} />
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
