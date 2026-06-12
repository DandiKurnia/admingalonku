"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { apiFetchData, apiFetchWithToken, AuthError } from "./api"
import type { ApiResponse, Permission, Role } from "./types"

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

export async function getRoles(): Promise<Role[]> {
  try {
    const token = await getToken()
    return await apiFetchData<Role[]>("/roles", token)
  } catch (err) {
    handleAuthError(err)
  }
}

export async function getPermissions(): Promise<Permission[]> {
  try {
    const token = await getToken()
    return await apiFetchData<Permission[]>("/permissions", token)
  } catch (err) {
    handleAuthError(err)
  }
}

export async function updateRolePermissions(
  id: number,
  permission_ids: number[]
): Promise<Role> {
  try {
    const token = await getToken()
    const res = await apiFetchWithToken<ApiResponse<Role>>(`/roles/${id}`, token, {
      method: "PATCH",
      body: JSON.stringify({ permission_ids }),
    })
    revalidatePath("/roles")
    return res.data
  } catch (err) {
    handleAuthError(err)
  }
}
