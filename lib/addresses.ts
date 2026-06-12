"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { apiFetchData, apiFetchWithToken, AuthError } from "./api"
import type { Address, ApiResponse } from "./types"

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

export async function getAddresses(limit?: number): Promise<Address[]> {
  try {
    const token = await getToken()
    const qs = limit ? `?limit=${limit}` : ""
    return await apiFetchData<Address[]>(`/address${qs}`, token)
  } catch (err) {
    handleAuthError(err)
  }
}

export async function getAddressById(id: number): Promise<Address> {
  try {
    const token = await getToken()
    return await apiFetchData<Address>(`/address/${id}`, token)
  } catch (err) {
    handleAuthError(err)
  }
}

export interface AddressInput {
  name: string
  address: string
  latitude?: number
  longitude?: number
}

export async function createAddress(input: AddressInput): Promise<Address> {
  try {
    const token = await getToken()
    const res = await apiFetchWithToken<ApiResponse<Address>>("/address", token, {
      method: "POST",
      body: JSON.stringify(input),
    })
    revalidatePath("/addresses")
    return res.data
  } catch (err) {
    handleAuthError(err)
  }
}

export async function updateAddress(
  id: number,
  input: Partial<AddressInput>
): Promise<Address> {
  try {
    const token = await getToken()
    const res = await apiFetchWithToken<ApiResponse<Address>>(
      `/address/${id}`,
      token,
      {
        method: "PATCH",
        body: JSON.stringify(input),
      }
    )
    revalidatePath("/addresses")
    return res.data
  } catch (err) {
    handleAuthError(err)
  }
}

export async function deleteAddress(id: number): Promise<void> {
  try {
    const token = await getToken()
    await apiFetchWithToken<ApiResponse<null>>(`/address/${id}`, token, {
      method: "DELETE",
    })
    revalidatePath("/addresses")
  } catch (err) {
    handleAuthError(err)
  }
}
