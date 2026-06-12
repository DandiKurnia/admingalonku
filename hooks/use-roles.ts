"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getRoles,
  getPermissions,
  updateRolePermissions,
} from "@/lib/roles"

export const roleKeys = {
  roles: ["roles"] as const,
  permissions: ["permissions"] as const,
}

export function useRoles() {
  return useQuery({ queryKey: roleKeys.roles, queryFn: () => getRoles() })
}

export function usePermissions() {
  return useQuery({
    queryKey: roleKeys.permissions,
    queryFn: () => getPermissions(),
  })
}

export function useUpdateRolePermissions() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      permission_ids,
    }: {
      id: number
      permission_ids: number[]
    }) => updateRolePermissions(id, permission_ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: roleKeys.roles }),
  })
}
