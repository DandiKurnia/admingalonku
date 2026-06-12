import { AppShell } from "@/components/app-shell"

export default function HelpPage() {
  return (
    <AppShell title="Help & Support">
      <div className="px-4 lg:px-6">
        <div className="mb-4">
          <h2 className="text-2xl font-semibold tracking-tight">Help & Support</h2>
          <p className="text-sm text-muted-foreground">
            Get help using the GalonKu Administrator panel.
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">Documentation and support links are coming soon.</p>
        </div>
      </div>
    </AppShell>
  )
}
