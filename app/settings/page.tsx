import { AppShell } from "@/components/app-shell"

export default function SettingsPage() {
  return (
    <AppShell title="Settings">
      <div className="px-4 lg:px-6">
        <div className="mb-4">
          <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
          <p className="text-sm text-muted-foreground">
            Configure system parameters and application defaults.
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">Settings panel is coming soon.</p>
        </div>
      </div>
    </AppShell>
  )
}
