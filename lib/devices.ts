"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { apiFetchData, apiFetchWithToken } from "./api"
import type { ApiResponse, Device } from "./types"

async function getToken() {
  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value
  if (!token) throw new Error("Unauthorized")
  return token
}

export async function getDevices(): Promise<Device[]> {
  const token = await getToken()
  return apiFetchData<Device[]>("/devices", token)
}

export async function getDeviceById(id: number): Promise<Device> {
  const token = await getToken()
  return apiFetchData<Device>(`/devices/${id}`, token)
}

export async function getDeviceByCode(code: string): Promise<Device> {
  const token = await getToken()
  return apiFetchData<Device>(`/devices/scan/${code}`, token)
}

export interface DeviceInput {
  name: string
  address_id: number
}

export async function createDevice(input: DeviceInput): Promise<Device> {
  const token = await getToken()
  const res = await apiFetchWithToken<ApiResponse<Device>>("/devices", token, {
    method: "POST",
    body: JSON.stringify(input),
  })
  revalidatePath("/devices")
  return res.data
}

export async function updateDevice(
  id: number,
  input: Partial<DeviceInput>
): Promise<Device> {
  const token = await getToken()
  const res = await apiFetchWithToken<ApiResponse<Device>>(
    `/devices/${id}`,
    token,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    }
  )
  revalidatePath("/devices")
  return res.data
}

export async function deleteDevice(id: number): Promise<void> {
  const token = await getToken()
  await apiFetchWithToken<ApiResponse<null>>(`/devices/${id}`, token, {
    method: "DELETE",
  })
  revalidatePath("/devices")
}
