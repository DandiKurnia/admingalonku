"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { apiFetch, apiFetchData, apiFetchWithToken } from "./api"
import type { ApiResponse, User } from "./types"

async function getToken() {
  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value
  if (!token) throw new Error("Unauthorized")
  return token
}

export interface RegisterUserInput {
  name: string
  email: string
  password: string
  phone_number: string
  roleId: number
  addressId?: number
}

export async function registerUser(
  input: RegisterUserInput
): Promise<ApiResponse<User>> {
  const token = await getToken()
  const res = await apiFetchWithToken<ApiResponse<User>>("/users", token, {
    method: "POST",
    body: JSON.stringify(input),
  })
  revalidatePath("/users")
  return res
}

export async function getUsers(): Promise<User[]> {
  const token = await getToken()
  return apiFetchData<User[]>("/users", token)
}

export async function getUserById(id: number): Promise<User> {
  const token = await getToken()
  return apiFetchData<User>(`/users/${id}`, token)
}

export interface UpdateUserInput {
  name?: string
  email?: string
  phone_number?: string
  password?: string
  role_id?: number
  address_id?: number | null
}

export async function updateUser(
  id: number,
  input: UpdateUserInput
): Promise<User> {
  const token = await getToken()
  const res = await apiFetchWithToken<ApiResponse<User>>(`/users/${id}`, token, {
    method: "PATCH",
    body: JSON.stringify(input),
  })
  revalidatePath("/users")
  return res.data
}
