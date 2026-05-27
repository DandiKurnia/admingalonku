"use client"

import * as React from "react"
import type { User } from "./types"

interface AuthContextValue {
  user: User | null
  hasPermission: (key: string) => boolean
  isRole: (key: string) => boolean
}

const AuthContext = React.createContext<AuthContextValue>({
  user: null,
  hasPermission: () => false,
  isRole: () => false,
})

export function AuthProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode
  initialUser: User | null
}) {
  const [user] = React.useState<User | null>(initialUser)

  const hasPermission = React.useCallback(
    (key: string) => {
      if (!user) return false
      if (user.role.key === "super-admin") return true
      return user.role.permissions.some((p) => p.key === key)
    },
    [user]
  )

  const isRole = React.useCallback(
    (key: string) => {
      if (!user) return false
      return user.role.key === key
    },
    [user]
  )

  return (
    <AuthContext value={{ user, hasPermission, isRole }}>
      {children}
    </AuthContext>
  )
}

export function useAuth() {
  return React.use(AuthContext)
}
