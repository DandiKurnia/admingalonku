"use client"

import { useTransactionSummary } from "@/hooks/use-transactions"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { HardDriveIcon, DollarSignIcon, ShoppingBagIcon, RefreshCwIcon } from "lucide-react"

export function SectionCards({ addressId }: { addressId?: number }) {
  const { data, isLoading } = useTransactionSummary(addressId)

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  const revenue = data?.total_revenue ?? 0
  const galons = data?.total_galons ?? 0
  const transactions = data?.total_transactions ?? 0
  const devices = data?.total_devices ?? 0

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Revenue</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            Rp {revenue.toLocaleString("id-ID")}
          </CardTitle>
          <CardAction>
            <DollarSignIcon className="size-5 text-primary opacity-80" />
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            Total omset pendapatan kedai
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Galons Sold</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {galons.toLocaleString("id-ID")} galon
          </CardTitle>
          <CardAction>
            <ShoppingBagIcon className="size-5 text-primary opacity-80" />
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            Total akumulasi air terisi
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Transactions</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {transactions.toLocaleString("id-ID")}
          </CardTitle>
          <CardAction>
            <RefreshCwIcon className="size-5 text-primary opacity-80" />
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            Jumlah transaksi sukses (PAID)
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Active Devices</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {devices.toLocaleString("id-ID")} unit
          </CardTitle>
          <CardAction>
            <HardDriveIcon className="size-5 text-primary opacity-80" />
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            Dispenser pintar aktif terpasang
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
