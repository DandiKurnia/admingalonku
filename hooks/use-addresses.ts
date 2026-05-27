"use client"

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query"
import {
  getAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  type AddressInput,
} from "@/lib/addresses"
import type { Address } from "@/lib/types"

export const addressKeys = {
  all: ["addresses"] as const,
  list: (limit?: number) => [...addressKeys.all, "list", { limit }] as const,
  detail: (id: number) => [...addressKeys.all, "detail", id] as const,
}

export function useAddresses(
  limit?: number,
  options?: Omit<UseQueryOptions<Address[]>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: addressKeys.list(limit),
    queryFn: () => getAddresses(limit),
    ...options,
  })
}

export function useAddress(id: number) {
  return useQuery({
    queryKey: addressKeys.detail(id),
    queryFn: () => getAddressById(id),
    enabled: Number.isFinite(id),
  })
}

export function useCreateAddress() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: AddressInput) => createAddress(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: addressKeys.all })
    },
  })
}

export function useUpdateAddress() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number
      input: Partial<AddressInput>
    }) => updateAddress(id, input),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: addressKeys.all })
      qc.invalidateQueries({ queryKey: addressKeys.detail(vars.id) })
    },
  })
}

export function useDeleteAddress() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteAddress(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: addressKeys.all })
    },
  })
}
