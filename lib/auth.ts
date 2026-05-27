"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { apiFetch } from "./api"
import type { LoginResponse, User } from "./types"

export async function login(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  let res: LoginResponse

  try {
    res = await apiFetch<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
    console.log("DEBUG LOGIN API RESPONSE:", JSON.stringify(res))
  } catch (err) {
    console.error("DEBUG LOGIN API ERROR:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Login failed",
    }
  }

  const cookieStore = await cookies()

  cookieStore.set("access_token", res.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  })

  // Clean up user object to fit browser's 4KB cookie size limit (original res.user is 5.3KB+)
  const minimalUser: User = {
    id: res.user.id,
    name: res.user.name,
    email: res.user.email,
    avatar: res.user.avatar,
    role: {
      key: res.user.role.key,
      permissions: res.user.role.permissions.map((p) => ({
        key: p.key,
      })),
    },
  }

  cookieStore.set("user", encodeURIComponent(JSON.stringify(minimalUser)), {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  })

  return { success: true }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete("access_token")
  cookieStore.delete("user")
  redirect("/login")
}

export async function getSession(): Promise<{
  token: string | null
  user: User | null
}> {
  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value || null
  const userCookie = cookieStore.get("user")?.value

  let user: User | null = null
  if (userCookie) {
    try {
      user = JSON.parse(decodeURIComponent(userCookie))
    } catch {
      user = null
    }
  }

  return { token, user }
}
