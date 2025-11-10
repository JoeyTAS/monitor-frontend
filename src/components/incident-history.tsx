"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Clock, Zap, XCircle } from "lucide-react"

interface Incident {
  id: string
  timestamp: Date
  type: "outage" | "slow_response" | "timeout"
  duration: number
  description: string
}

interface MonitoredSite {
  id: string
  url: string
  name: string
  status: "online" | "offline" | "checking"
  responseTime: number
  uptime: number
  lastChecked: Date
  incidents: Incident[]
}

interface IncidentHistoryProps {
  sites: MonitoredSite[]
}

export function IncidentHistory({ sites }: IncidentHistoryProps) {
  // Recopilar todos los incidentes de todos los sitios
  const allIncidents = sites.flatMap((site) =>
    site.incidents.map((incident) => ({
      ...incident,
      siteName: site.name,
      siteUrl: site.url,
    })),
  )

  // Ordenar por fecha más reciente
  const sortedIncidents = allIncidents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

  const getIncidentIcon = (type: Incident["type"]) => {
    switch (type) {
      case "outage":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "slow_response":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "timeout":
        return <Zap className="h-4 w-4 text-orange-500" />
    }
  }

  const getIncidentBadge = (type: Incident["type"]) => {
    const variants = {
      outage: "bg-red-100 text-red-800 border-red-200",
      slow_response: "bg-yellow-100 text-yellow-800 border-yellow-200",
      timeout: "bg-orange-100 text-orange-800 border-orange-200",
    }

    const labels = {
      outage: "Caída",
      slow_response: "Respuesta Lenta",
      timeout: "Timeout",
    }

    return (
      <Badge variant="outline" className={variants[type]}>
        {labels[type]}
      </Badge>
    )
  }

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
  }

  // Generar algunos incidentes de ejemplo si no hay ninguno
  const exampleIncidents = [
    {
      id: "ex1",
      timestamp: new Date(Date.now() - 3600000),
      type: "slow_response" as const,
      duration: 180,
      description: "Tiempo de respuesta elevado detectado",
      siteName: "Ejemplo.com",
      siteUrl: "https://ejemplo.com",
    },
    {
      id: "ex2",
      timestamp: new Date(Date.now() - 7200000),
      type: "timeout" as const,
      duration: 45,
      description: "Timeout en la conexión",
      siteName: "Test.org",
      siteUrl: "https://test.org",
    },
  ]

  const displayIncidents = sortedIncidents.length > 0 ? sortedIncidents : exampleIncidents

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Historial de Incidentes
        </CardTitle>
        <CardDescription>Registro completo de todos los incidentes detectados en tus sitios web</CardDescription>
      </CardHeader>
      <CardContent>
        {displayIncidents.length === 0 ? (
          <div className="text-center py-8">
            <div className="p-3 bg-emerald-100 rounded-full w-fit mx-auto mb-4">
              <AlertTriangle className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="font-medium text-lg mb-2">¡Sin incidentes!</h3>
            <p className="text-muted-foreground">Todos tus sitios web están funcionando correctamente.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayIncidents.map((incident) => (
              <div key={incident.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getIncidentIcon(incident.type)}
                    <div>
                      <h4 className="font-medium">{incident.siteName}</h4>
                      <p className="text-sm text-muted-foreground">{incident.siteUrl}</p>
                    </div>
                  </div>
                  {getIncidentBadge(incident.type)}
                </div>

                <p className="text-sm">{incident.description}</p>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    {incident.timestamp.toLocaleDateString()} a las {incident.timestamp.toLocaleTimeString()}
                  </span>
                  <span>Duración: {formatDuration(incident.duration)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
