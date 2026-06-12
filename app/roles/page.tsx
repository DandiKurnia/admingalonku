import { AppShell } from "@/components/app-shell"
import { RolesMatrix } from "@/components/roles-matrix"
import { RoleGuard } from "@/components/permission-guard"

export default function RolesPage() {
  return (
    <AppShell title="Roles & Permissions">
      <RoleGuard roleKey="super-admin">
        <RolesMatrix />
      </RoleGuard>
    </AppShell>
  )
}
