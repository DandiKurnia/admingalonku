import { AppShell } from "@/components/app-shell"
import { DeviceList } from "@/components/device-list"
import { PermissionGuard } from "@/components/permission-guard"

export default function DevicesPage() {
  return (
    <AppShell title="Devices">
      <PermissionGuard permissionKey="devices.read">
        <DeviceList />
      </PermissionGuard>
    </AppShell>
  )
}
