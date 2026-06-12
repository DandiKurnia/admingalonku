"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getDevices,
  getDeviceById,
  getDeviceByCode,
  createDevice,
  updateDevice,
  deleteDevice,
  rotateDeviceToken,
  revokeDeviceToken,
  type DeviceInput,
} from "@/lib/devices"

export const deviceKeys = {
  all: ["devices"] as const,
  list: () => [...deviceKeys.all, "list"] as const,
  detail: (id: number) => [...deviceKeys.all, "detail", id] as const,
  byCode: (code: string) => [...deviceKeys.all, "code", code] as const,
}

export function useDevices() {
  return useQuery({ queryKey: deviceKeys.list(), queryFn: () => getDevices() })
}

export function useDevice(id: number) {
  return useQuery({
    queryKey: deviceKeys.detail(id),
    queryFn: () => getDeviceById(id),
    enabled: Number.isFinite(id) && id > 0,
  })
}

export function useDeviceByCode(code: string) {
  return useQuery({
    queryKey: deviceKeys.byCode(code),
    queryFn: () => getDeviceByCode(code),
    enabled: !!code,
  })
}

export function useCreateDevice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: DeviceInput) => createDevice(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: deviceKeys.all }),
  })
}

export function useUpdateDevice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number
      input: Partial<DeviceInput>
    }) => updateDevice(id, input),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: deviceKeys.all })
      qc.invalidateQueries({ queryKey: deviceKeys.detail(vars.id) })
    },
  })
}

export function useDeleteDevice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteDevice(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: deviceKeys.all }),
  })
}

export function useRotateDeviceToken() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => rotateDeviceToken(id),
    onSuccess: (_d, id) => {
      qc.invalidateQueries({ queryKey: deviceKeys.all })
      qc.invalidateQueries({ queryKey: deviceKeys.detail(id) })
    },
  })
}

export function useRevokeDeviceToken() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => revokeDeviceToken(id),
    onSuccess: (_d, id) => {
      qc.invalidateQueries({ queryKey: deviceKeys.all })
      qc.invalidateQueries({ queryKey: deviceKeys.detail(id) })
    },
  })
}
