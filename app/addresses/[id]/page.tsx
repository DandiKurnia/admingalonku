import { AppShell } from "@/components/app-shell"
import { AddressDetail } from "@/components/address-detail"
import { PermissionGuard } from "@/components/permission-guard"

export default async function AddressDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const numericId = Number(id)

  return (
    <AppShell title="Address Detail">
      <PermissionGuard permissionKey="addresses.read">
        <AddressDetail id={numericId} />
      </PermissionGuard>
    </AppShell>
  )
}
