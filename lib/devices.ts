"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { apiFetchData, apiFetchWithToken, AuthError } from "./api"
import type { ApiResponse, Device } from "./types"

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

export async function getDevices(): Promise<Device[]> {
  try {
    const token = await getToken()
    return await apiFetchData<Device[]>("/devices", token)
  } catch (err) {
    handleAuthError(err)
  }
}

export async function getDeviceById(id: number): Promise<Device> {
  try {
    const token = await getToken()
    return await apiFetchData<Device>(`/devices/${id}`, token)
  } catch (err) {
    handleAuthError(err)
  }
}

export async function getDeviceByCode(code: string): Promise<Device> {
  try {
    const token = await getToken()
    return await apiFetchData<Device>(`/devices/scan/${code}`, token)
  } catch (err) {
    handleAuthError(err)
  }
}

export interface DeviceInput {
  name: string
  address_id: number
  status_device?: "ACTIVE" | "INACTIVE"
}

export interface CreateDeviceResponse {
  device: Device
  raw_device_token: string
}

export async function createDevice(
  input: DeviceInput
): Promise<CreateDeviceResponse> {
  try {
    const token = await getToken()
    const res = await apiFetchWithToken<ApiResponse<CreateDeviceResponse>>(
      "/devices",
      token,
      {
        method: "POST",
        body: JSON.stringify(input),
      }
    )
    revalidatePath("/devices")
    return res.data
  } catch (err) {
    handleAuthError(err)
  }
}

export async function updateDevice(
  id: number,
  input: Partial<DeviceInput>
): Promise<Device> {
  try {
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
  } catch (err) {
    handleAuthError(err)
  }
}

export async function deleteDevice(id: number): Promise<void> {
  try {
    const token = await getToken()
    await apiFetchWithToken<ApiResponse<null>>(`/devices/${id}`, token, {
      method: "DELETE",
    })
    revalidatePath("/devices")
  } catch (err) {
    handleAuthError(err)
  }
}

export interface RotateTokenResponse {
  raw_device_token: string
}

export async function rotateDeviceToken(
  id: number
): Promise<RotateTokenResponse> {
  try {
    const token = await getToken()
    const res = await apiFetchWithToken<ApiResponse<RotateTokenResponse>>(
      `/devices/${id}/rotate-token`,
      token,
      { method: "POST" }
    )
    revalidatePath("/devices")
    return res.data
  } catch (err) {
    handleAuthError(err)
  }
}

export async function revokeDeviceToken(id: number): Promise<void> {
  try {
    const token = await getToken()
    await apiFetchWithToken<ApiResponse<null>>(
      `/devices/${id}/revoke-token`,
      token,
      { method: "POST" }
    )
    revalidatePath("/devices")
  } catch (err) {
    handleAuthError(err)
  }
}
