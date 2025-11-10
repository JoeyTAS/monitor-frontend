"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Globe, AlertCircle } from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/api"

export function RegisterForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validations
    if (formData.password !== formData.passwordConfirm) {
      setError("Las contraseñas no coinciden")
      return
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    setIsLoading(true)

    try {
      const response = await api.register(formData.email, formData.password)

      if (response.access_token) {
        localStorage.setItem("token", response.access_token)
        router.push("/dashboard")
      }
    } catch (err) {
      setError("Error al registrar. Intenta de nuevo.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Globe className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-center text-2xl">Crear Cuenta</CardTitle>
          <CardDescription className="text-center">
            Regístrate para comenzar a monitorear tus sitios web
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                name="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Contraseña</label>
              <Input
                type="password"
                name="password"
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Confirmar Contraseña</label>
              <Input
                type="password"
                name="passwordConfirm"
                placeholder="Repite tu contraseña"
                value={formData.passwordConfirm}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Registrando..." : "Crear Cuenta"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Inicia sesión aquí
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
