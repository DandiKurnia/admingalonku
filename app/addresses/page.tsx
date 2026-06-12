import { AppShell } from "@/components/app-shell"
import { AddressList } from "@/components/address-list"
import { PermissionGuard } from "@/components/permission-guard"

export default function AddressesPage() {
  return (
    <AppShell title="Addresses">
      <PermissionGuard permissionKey="addresses.read">
        <AddressList />
      </PermissionGuard>
    </AppShell>
  )
}
