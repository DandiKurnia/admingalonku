import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import type { ApiResponse } from "./types"

const API_URL =
  typeof window === "undefined"
    ? (process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000")
    : (process.env.NEXT_PUBLIC_API_URL ||
       (window.location.hostname.endsWith("galonku.my.id")
         ? "https://api.galonku.my.id"
         : "http://localhost:3000"))

// Backend JWT cookie lifetimes (must match backend env).
const ACCESS_TOKEN_MAX_AGE = 60 * 30 // 30 minutes (JWT_EXPIRES_IN=30m)
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7 // 7 days (REFRESH_TOKEN_EXPIRES_IN=7d)

export class AuthError extends Error {
  constructor(message = "Unauthorized") {
    super(message)
    this.name = "AuthError"
  }
}

async function tryRefreshAccessToken(): Promise<string | null> {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get("refresh_token")?.value
  if (!refreshToken) return null

  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
      cache: "no-store",
    })

    if (!res.ok) return null

    const data = (await res.json()) as {
      access_token?: string
      refresh_token?: string
    }

    if (data.access_token) {
      cookieStore.set("access_token", data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: ACCESS_TOKEN_MAX_AGE,
        path: "/",
      })
    }

    if (data.refresh_token) {
      cookieStore.set("refresh_token", data.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: REFRESH_TOKEN_MAX_AGE,
        path: "/",
      })
    }

    return data.access_token ?? null
  } catch {
    return null
  }
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData

  const headers: HeadersInit = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...options.headers,
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Request failed" }))
    if (res.status === 401) {
      throw new AuthError(error.message || "Unauthorized")
    }
    throw new Error(error.message || `HTTP ${res.status}`)
  }

  return res.json()
}

export async function apiFetchWithToken<T>(
  endpoint: string,
  token: string,
  options: RequestInit = {},
  isRetry = false
): Promise<T> {
  try {
    return await apiFetch<T>(endpoint, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    })
  } catch (err) {
    // Access token expired → swap it via refresh token, then retry once.
    if (!isRetry && err instanceof AuthError) {
      const newToken = await tryRefreshAccessToken()
      if (newToken) {
        return apiFetchWithToken<T>(endpoint, newToken, options, true)
      }
      // Refresh also failed → session is over.
      const cookieStore = await cookies()
      cookieStore.delete("access_token")
      cookieStore.delete("refresh_token")
      cookieStore.delete("user")
      redirect("/login")
    }
    throw err
  }
}

export async function apiFetchData<T>(
  endpoint: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await apiFetchWithToken<ApiResponse<T>>(endpoint, token, options)
  return res.data
}
