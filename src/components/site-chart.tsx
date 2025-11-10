"use client"

import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { api, type SiteLog } from "@/lib/api"
import { getToken } from "@/lib/auth"

interface SiteChartProps {
  siteId: string
  siteName: string
}

export function SiteChart({ siteId, siteName }: SiteChartProps) {
  const [data, setData] = useState<SiteLog[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadHistory()
  }, [siteId])

  const loadHistory = async () => {
    try {
      const token = getToken()
      if (!token) return

      const logs = await api.getSiteHistory(token, siteId)
      setData(logs)
    } catch (err) {
      console.error("Error loading history:", err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="h-48 flex items-center justify-center text-muted-foreground">Cargando histórico...</div>
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
            Sin datos históricos disponibles
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartData = data
    .slice()
    .reverse()
    .map((log) => ({
      timestamp: new Date(log.timestamp).toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      responseTime: log.response_time,
      status: log.status === "online" ? 100 : 0,
      statusLabel: log.status,
    }))

  return (
    <div className="space-y-4">
      {/* Response Time Chart */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Tiempo de Respuesta</CardTitle>
          <CardDescription className="text-xs">Últimas {data.length} verificaciones</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="timestamp"
                tick={{ fontSize: 11 }}
                interval={Math.max(0, Math.floor(chartData.length / 4))}
              />
              <YAxis tick={{ fontSize: 11 }} label={{ value: "ms", angle: -90, position: "insideLeft" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value) => `${value}ms`}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Line
                type="monotone"
                dataKey="responseTime"
                stroke="#3b82f6"
                dot={false}
                strokeWidth={2.5}
                isAnimationActive={false}
                name="Respuesta (ms)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Status Availability Chart */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Disponibilidad</CardTitle>
          <CardDescription className="text-xs">Estado del sitio en el tiempo</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="timestamp"
                tick={{ fontSize: 11 }}
                interval={Math.max(0, Math.floor(chartData.length / 4))}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                domain={[0, 100]}
                label={{ value: "Estado", angle: -90, position: "insideLeft" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value, name, props) => [value === 100 ? "En línea" : "Fuera de línea", "Estado"]}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Line
                type="stepAfter"
                dataKey="status"
                stroke="#10b981"
                dot={false}
                strokeWidth={2.5}
                isAnimationActive={false}
                name="Disponibilidad"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
