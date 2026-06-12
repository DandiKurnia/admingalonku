"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  registerUser,
  getUsers,
  getUserById,
  updateUser,
  type RegisterUserInput,
  type UpdateUserInput,
} from "@/lib/users"

export const userKeys = {
  all: ["users"] as const,
  list: () => [...userKeys.all, "list"] as const,
  detail: (id: number) => [...userKeys.all, "detail", id] as const,
}

export function useUsers() {
  return useQuery({ queryKey: userKeys.list(), queryFn: () => getUsers() })
}

export function useUser(id: number) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => getUserById(id),
    enabled: Number.isFinite(id),
  })
}

export function useRegisterUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: RegisterUserInput) => registerUser(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.all }),
  })
}

export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateUserInput }) =>
      updateUser(id, input),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: userKeys.all })
      qc.invalidateQueries({ queryKey: userKeys.detail(vars.id) })
    },
  })
}
