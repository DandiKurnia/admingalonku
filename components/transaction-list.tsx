"use client"

import * as React from "react"
import {
  useTransactions,
  useTransaction,
} from "@/hooks/use-transactions"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { ReceiptIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

const PAGE_SIZE = 10

function formatRupiah(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n)
}

function statusVariant(status: string) {
  const s = status?.toUpperCase()
  if (s === "PAID" || s === "SUCCESS") return "default"
  if (s === "PENDING") return "secondary"
  if (s === "EXPIRED" || s === "FAILED" || s === "CANCELLED") return "destructive"
  return "outline"
}

export function TransactionList() {
  const { data, isLoading, error } = useTransactions()
  const [openId, setOpenId] = React.useState<number | null>(null)
  const [page, setPage] = React.useState(1)

  const total = data?.length ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * PAGE_SIZE
  const pageRows = React.useMemo(
    () => (data ?? []).slice(start, start + PAGE_SIZE),
    [data, start]
  )

  if (page > totalPages) {
    React.startTransition(() => setPage(totalPages))
  }

  return (
    <div className="px-4 lg:px-6">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold tracking-tight">Transactions</h2>
        <p className="text-sm text-muted-foreground">
          All gallon orders and payment status.
        </p>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">No</TableHead>
              <TableHead>Galon</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              [0, 1, 2].map((i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))}
            {error && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-8 text-center text-sm text-destructive"
                >
                  {error instanceof Error ? error.message : "Failed to load"}
                </TableCell>
              </TableRow>
            )}
            {!isLoading && total === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  <ReceiptIcon className="mx-auto mb-2 size-6 opacity-50" />
                  No transactions yet.
                </TableCell>
              </TableRow>
            )}
            {pageRows.map((row, index) => (
              <TableRow
                key={row.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => setOpenId(row.id)}
              >
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {start + index + 1}
                </TableCell>
                <TableCell>{row.total_galon}</TableCell>
                <TableCell className="font-medium">
                  {formatRupiah(row.total_price)}
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant(row.status)}>
                    {row.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {row.payment ? (
                    <Badge variant={statusVariant(row.payment.status)}>
                      {row.payment.status}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(row.created_at).toLocaleString("en-US")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {total > 0 && (
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Showing {start + 1}–
            {Math.min(start + PAGE_SIZE, total)} of {total}
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
            >
              <ChevronLeftIcon />
              Previous
            </Button>
            <span className="px-2 text-muted-foreground">
              Page {safePage} of {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
            >
              Next
              <ChevronRightIcon />
            </Button>
          </div>
        </div>
      )}

      <TransactionDetailSheet
        id={openId}
        onClose={() => setOpenId(null)}
      />
    </div>
  )
}

function TransactionDetailSheet({
  id,
  onClose,
}: {
  id: number | null
  onClose: () => void
}) {
  const { data, isLoading, error } = useTransaction(id ?? -1)

  return (
    <Sheet open={id !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Transaction #{id}</SheetTitle>
          <SheetDescription>
            Full payment, fill log, and status history.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-4 pb-4">
          {isLoading && <Skeleton className="h-40 w-full" />}
          {error && (
            <p className="text-sm text-destructive">
              {error instanceof Error ? error.message : "Failed to load"}
            </p>
          )}
          {data && (
            <>
              <Section title="Order">
                <KV k="Galon" v={data.total_galon} />
                <KV k="Total" v={formatRupiah(data.total_price)} />
                <KV
                  k="Status"
                  v={<Badge variant={statusVariant(data.status)}>{data.status}</Badge>}
                />
                <KV
                  k="Created"
                  v={new Date(data.created_at).toLocaleString("en-US")}
                />
              </Section>

              {data.device && (
                <Section title="Device">
                  <KV k="Name" v={data.device.name} />
                  <KV k="Code" v={<span className="font-mono">{data.device.device_code}</span>} />
                </Section>
              )}

              {data.user && (
                <Section title="Customer">
                  <KV k="Name" v={data.user.name} />
                  <KV k="Email" v={data.user.email} />
                </Section>
              )}

              {data.payment && (
                <Section title="Payment">
                  <KV
                    k="Status"
                    v={<Badge variant={statusVariant(data.payment.status)}>{data.payment.status}</Badge>}
                  />
                  <KV
                    k="Method"
                    v={data.payment.payment_method ?? "—"}
                  />
                  <KV
                    k="Invoice"
                    v={
                      <a
                        href={data.payment.invoice_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary underline-offset-2 hover:underline"
                      >
                        Open
                      </a>
                    }
                  />
                  <KV k="External ID" v={<span className="font-mono text-xs">{data.payment.external_id}</span>} />
                  <KV
                    k="Expiry"
                    v={new Date(data.payment.expiry_date).toLocaleString("en-US")}
                  />
                </Section>
              )}

              {data.transaction_details && data.transaction_details.length > 0 && (
                <Section title="Transaction Details">
                  <ul className="space-y-1 text-sm">
                    {data.transaction_details.map((d) => (
                      <li
                        key={d.id}
                        className="flex items-center justify-between gap-2"
                      >
                        <span>
                          {d.galon_qty} galon ×{" "}
                          <span className="font-mono">
                            {new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: "IDR",
                              maximumFractionDigits: 0,
                            }).format(d.price_one_galon)}
                          </span>
                        </span>
                        <span className="font-medium">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "IDR",
                            maximumFractionDigits: 0,
                          }).format(d.sub_total)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {data.transaction_histories &&
                data.transaction_histories.length > 0 && (
                  <Section title="History">
                    <ul className="space-y-1 text-sm">
                      {data.transaction_histories.map((h) => (
                        <li key={h.id} className="flex justify-between gap-2">
                          <span>
                            <Badge variant={statusVariant(h.status)}>
                              {h.status}
                            </Badge>
                            {h.description && (
                              <span className="ml-2 text-muted-foreground">
                                {h.description}
                              </span>
                            )}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(h.created_at).toLocaleString("en-US")}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </Section>
                )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-md border p-3">
      <h3 className="mb-2 text-sm font-semibold">{title}</h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  )
}

function KV({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className="text-muted-foreground">{k}</span>
      <span className="text-right">{v}</span>
    </div>
  )
}
