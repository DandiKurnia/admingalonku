import { AppShell } from "@/components/app-shell"
import { UserList } from "@/components/user-list"
import { RoleGuard } from "@/components/permission-guard"

export default function UsersPage() {
  return (
    <AppShell title="Users">
      <RoleGuard roleKey="super-admin">
        <UserList />
      </RoleGuard>
    </AppShell>
  )
}
