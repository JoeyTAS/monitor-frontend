"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getToken } from "@/lib/auth"
import { Activity } from "lucide-react"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const token = getToken()
    if (token) {
      router.push("/dashboard")
    } else {
      router.push("/login")
    }
  }, [router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Activity className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}
