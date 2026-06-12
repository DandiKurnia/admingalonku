"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getProfile, updateProfile } from "@/lib/profile"

export const profileKeys = {
  me: ["profile", "me"] as const,
}

export function useProfile() {
  return useQuery({
    queryKey: profileKeys.me,
    queryFn: () => getProfile(),
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (formData: FormData) => updateProfile(formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: profileKeys.me })
    },
  })
}
