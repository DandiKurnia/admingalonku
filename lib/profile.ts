"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { apiFetchData, apiFetchWithToken } from "./api"
import type { ApiResponse, User } from "./types"

async function getToken() {
  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value
  if (!token) throw new Error("Unauthorized")
  return token
}

export async function getProfile(): Promise<User> {
  const token = await getToken()
  return apiFetchData<User>("/profile", token)
}

export async function updateProfile(formData: FormData): Promise<User> {
  const token = await getToken()
  const res = await apiFetchWithToken<ApiResponse<User>>("/profile", token, {
    method: "PATCH",
    body: formData,
  })

  const cookieStore = await cookies()
  cookieStore.set("user", JSON.stringify(res.data), {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  })

  revalidatePath("/profile")
  return res.data
}
