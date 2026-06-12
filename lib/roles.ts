"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { apiFetchData, apiFetchWithToken } from "./api"
import type { ApiResponse, Permission, Role } from "./types"

async function getToken() {
  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value
  if (!token) throw new Error("Unauthorized")
  return token
}

export async function getRoles(): Promise<Role[]> {
  const token = await getToken()
  return apiFetchData<Role[]>("/roles", token)
}

export async function getPermissions(): Promise<Permission[]> {
  const token = await getToken()
  return apiFetchData<Permission[]>("/permissions", token)
}

export async function updateRolePermissions(
  id: number,
  permission_ids: number[]
): Promise<Role> {
  const token = await getToken()
  const res = await apiFetchWithToken<ApiResponse<Role>>(`/roles/${id}`, token, {
    method: "PATCH",
    body: JSON.stringify({ permission_ids }),
  })
  revalidatePath("/roles")
  return res.data
}
