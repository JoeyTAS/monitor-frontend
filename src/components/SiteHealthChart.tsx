"use client"

import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface SiteHealthChartProps {
  sites: {
    name: string
    latest_log?: { status: "online" | "offline"; response_time: number }
  }[]
}

export function SiteHealthChart({ sites }: SiteHealthChartProps) {
  // Calcula puntaje (0-100)
  const labels = sites.map(s => s.name)
  const scores = sites.map(s => {
    if (!s.latest_log) return 50
    let score = 100
    if (s.latest_log.status === "offline") score -= 50
    score -= Math.min(s.latest_log.response_time / 100, 30) // penaliza tiempo alto
    return Math.max(score, 0)
  })

  const data = {
    labels,
    datasets: [
      {
        label: "Puntaje de salud",
        data: scores,
        fill: false,
        borderColor: "rgba(34,197,94,0.8)",
        backgroundColor: "rgba(34,197,94,0.5)",
        tension: 0.3, // suaviza la línea
        pointRadius: 5,
        pointBackgroundColor: scores.map(score =>
          score > 70 ? "rgba(34,197,94,1)" : score > 40 ? "rgba(251,191,36,1)" : "rgba(239,68,68,1)"
        ),
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "Comparación de salud de los sitios" },
    },
    scales: {
      y: { min: 0, max: 100, ticks: { stepSize: 20 } },
    },
  }

  return <Line data={data} options={options} />
}
