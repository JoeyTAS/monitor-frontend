const API_BASE_URL = "http://127.0.0.1:8000/api/v1"

export interface AuthResponse {
  access_token: string
  token_type: string
}

export interface Site {
  id: string
  url: string
  name: string
  latest_log: {
    id: number
    site_id: string
    timestamp: string
    status: "online" | "offline"
    response_time: number
  }
}

export interface SiteLog {
  id: number
  site_id: string
  timestamp: string
  status: "online" | "offline"
  response_time: number
}

export const api = {
  // Authentication
  login: async (username: string, password: string): Promise<AuthResponse> => {
    const formData = new URLSearchParams()
    formData.append("username", username)
    formData.append("password", password)

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    })

    if (!response.ok) {
      throw new Error("Login failed")
    }

    return response.json()
  },

  register: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      throw new Error("Registration failed")
    }

    return response.json()
  },

  // Sites
  getSites: async (token: string): Promise<Site[]> => {
    const response = await fetch(`${API_BASE_URL}/sites/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch sites")
    }

    return response.json()
  },

  addSite: async (token: string, url: string): Promise<Site> => {
    const response = await fetch(`${API_BASE_URL}/sites/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ url }),
    })

    if (!response.ok) {
      throw new Error("Failed to add site")
    }

    return response.json()
  },

  // Site Logs/History
  getSiteHistory: async (token: string, siteId: string): Promise<SiteLog[]> => {
    const response = await fetch(`${API_BASE_URL}/sites/${siteId}/history`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch site history")
    }

    return response.json()
  },
}
