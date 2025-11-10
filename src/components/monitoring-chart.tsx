"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"

interface MonitoredSite {
  id: string
  url: string
  name: string
  status: "online" | "offline" | "checking"
  responseTime: number
  uptime: number
  lastChecked: Date
}

interface MonitoringChartProps {
  sites: MonitoredSite[]
}

export function MonitoringChart({ sites }: MonitoringChartProps) {
  // Generar datos simulados para las últimas 24 horas
  const generateChartData = () => {
    const data = []
    const now = new Date()

    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000)
      const hour = time.getHours()

      data.push({
        time: `${hour.toString().padStart(2, "0")}:00`,
        responseTime: Math.floor(Math.random() * 200) + 50,
        uptime: Math.random() * 5 + 95,
        onlineSites: Math.floor(Math.random() * 2) + sites.length - 1,
      })
    }

    return data
  }

  const chartData = generateChartData()

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Tiempo de Respuesta (24h)</CardTitle>
          <CardDescription>Tiempo de respuesta promedio en milisegundos</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="time" className="text-xs fill-muted-foreground" />
              <YAxis
                className="text-xs fill-muted-foreground"
                label={{ value: "ms", angle: -90, position: "insideLeft" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Area
                type="monotone"
                dataKey="responseTime"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Disponibilidad (24h)</CardTitle>
          <CardDescription>Porcentaje de disponibilidad por hora</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="time" className="text-xs fill-muted-foreground" />
              <YAxis
                domain={[90, 100]}
                className="text-xs fill-muted-foreground"
                label={{ value: "%", angle: -90, position: "insideLeft" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="uptime"
                stroke="hsl(var(--chart-1))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--chart-1))", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "hsl(var(--chart-1))", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
