"use server"

import { cookies } from "next/headers"

interface UserCookie {
  role?: {
    key?: string
    permissions?: { key: string }[]
  }
}

export async function checkPermission(key: string): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const userCookie = cookieStore.get("user")?.value
    if (!userCookie) return false

    let user: UserCookie
    try {
      user = JSON.parse(decodeURIComponent(userCookie))
    } catch {
      return false
    }

    const roleKey = user?.role?.key
    if (!roleKey) return false
    if (roleKey === "super-admin" || roleKey === "super_admin") return true

    // Check permissions stored in the cookie session
    return user.role?.permissions?.some((p: { key: string }) => p.key === key) ?? false
  } catch {
    return false
  }
}

export async function checkRole(key: string): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const userCookie = cookieStore.get("user")?.value
    if (!userCookie) return false

    const user = JSON.parse(decodeURIComponent(userCookie))
    return user?.role?.key === key
  } catch {
    return false
  }
}
