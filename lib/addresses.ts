"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { apiFetchData, apiFetchWithToken } from "./api"
import type { Address, ApiResponse } from "./types"

async function getToken() {
  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value
  if (!token) throw new Error("Unauthorized")
  return token
}

export async function getAddresses(limit?: number): Promise<Address[]> {
  const token = await getToken()
  const qs = limit ? `?limit=${limit}` : ""
  return apiFetchData<Address[]>(`/address${qs}`, token)
}

export async function getAddressById(id: number): Promise<Address> {
  const token = await getToken()
  return apiFetchData<Address>(`/address/${id}`, token)
}

export interface AddressInput {
  name: string
  address: string
  latitude?: number
  longitude?: number
}

export async function createAddress(input: AddressInput): Promise<Address> {
  const token = await getToken()
  const res = await apiFetchWithToken<ApiResponse<Address>>("/address", token, {
    method: "POST",
    body: JSON.stringify(input),
  })
  revalidatePath("/addresses")
  return res.data
}

export async function updateAddress(
  id: number,
  input: Partial<AddressInput>
): Promise<Address> {
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
}

export async function deleteAddress(id: number): Promise<void> {
  const token = await getToken()
  await apiFetchWithToken<ApiResponse<null>>(`/address/${id}`, token, {
    method: "DELETE",
  })
  revalidatePath("/addresses")
}
