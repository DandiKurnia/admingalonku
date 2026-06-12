import { checkPermission, checkRole } from "@/lib/permissions"
import { redirect } from "next/navigation"

export async function PermissionGuard({
  permissionKey,
  children,
}: {
  permissionKey: string
  children: React.ReactNode
}) {
  const allowed = await checkPermission(permissionKey)

  if (!allowed) {
    redirect("/")
  }

  return <>{children}</>
}

export async function RoleGuard({
  roleKey,
  children,
}: {
  roleKey: string
  children: React.ReactNode
}) {
  const allowed = await checkRole(roleKey)

  if (!allowed) {
    redirect("/")
  }

  return <>{children}</>
}
