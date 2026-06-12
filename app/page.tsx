import { AppShell } from "@/components/app-shell"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { SectionCards } from "@/components/section-cards"
import { getTransactionStats } from "@/lib/transactions"

export default async function Page() {
  let stats: { date: string; total_galon: number; total_price: number }[] = []
  try {
    stats = await getTransactionStats("daily")
  } catch {
    stats = []
  }

  return (
    <AppShell title="Dashboard">
      <div className="flex flex-col gap-6 py-6">
        <SectionCards />
        <div className="px-4 lg:px-6">
          <ChartAreaInteractive data={stats} />
        </div>
      </div>
    </AppShell>
  )
}
