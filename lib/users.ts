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
  try {
    const token = await getToken()
    const res = await apiFetchWithToken<ApiResponse<User>>("/users", token, {
      method: "POST",
      body: JSON.stringify(input),
    })
    revalidatePath("/users")
    return res
  } catch (err) {
    handleAuthError(err)
  }
}

export async function getUsers(): Promise<User[]> {
  try {
    const token = await getToken()
    return await apiFetchData<User[]>("/users", token)
  } catch (err) {
    handleAuthError(err)
  }
}

export async function getUserById(id: number): Promise<User> {
  try {
    const token = await getToken()
    return await apiFetchData<User>(`/users/${id}`, token)
  } catch (err) {
    handleAuthError(err)
  }
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
  try {
    const token = await getToken()
    const res = await apiFetchWithToken<ApiResponse<User>>(`/users/${id}`, token, {
      method: "PATCH",
      body: JSON.stringify(input),
    })
    revalidatePath("/users")
    return res.data
  } catch (err) {
    handleAuthError(err)
  }
}
