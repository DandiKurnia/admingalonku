"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { apiFetchData, apiFetchWithToken, AuthError } from "./api"
import type { ApiResponse, User } from "./types"

async function getToken() {
  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value
  if (!token) redirect("/login")
  return token
}

function handleAuthError(err: unknown): never {
  if (err instanceof AuthError) redirect("/login")
  throw err
}

export async function getProfile(): Promise<User> {
  try {
    const token = await getToken()
    return await apiFetchData<User>("/profile", token)
  } catch (err) {
    handleAuthError(err)
  }
}

export async function updateProfile(formData: FormData): Promise<User> {
  try {
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
  } catch (err) {
    handleAuthError(err)
  }
}
