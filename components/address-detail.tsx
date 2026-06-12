"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import { useAddress } from "@/hooks/use-addresses"
import { useCreateDevice } from "@/hooks/use-devices"
import { useTransactionStats } from "@/hooks/use-transactions"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import type { DeviceInput } from "@/lib/devices"
import { useAuth } from "@/lib/auth-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { ArrowLeftIcon, MapPinIcon, HardDriveIcon, PlusIcon } from "lucide-react"

function statusVariant(status: string) {
  const s = status?.toUpperCase()
  if (s === "ACTIVE") return "default"
  if (s === "INACTIVE") return "secondary"
  return "outline"
}

export function AddressDetail({ id }: { id: number }) {
  const { data, isLoading, error, refetch } = useAddress(id)
  const { hasPermission, isRole } = useAuth()
  const isAdmin = isRole("super-admin")
  const canCreate = hasPermission("devices.create")
  const createDevice = useCreateDevice()
  const [showForm, setShowForm] = React.useState(false)

  const { data: statsData, isLoading: isStatsLoading } = useTransactionStats(
    "daily",
    id,
    isAdmin
  )

  async function handleCreateDevice(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const payload: DeviceInput = {
      name: (fd.get("name") as string).trim(),
      address_id: id,
    }

    try {
      await createDevice.mutateAsync(payload)
      toast.success("Device created")
      setShowForm(false)
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create")
    }
  }

  if (Number.isNaN(id) || !Number.isFinite(id)) {
    return (
      <div className="px-4 lg:px-6">
        <p className="text-sm text-destructive">Invalid address id.</p>
      </div>
    )
  }

  return (
    <div className="px-4 lg:px-6">
      <div className="mb-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link href="/addresses" />}
        >
          <ArrowLeftIcon />
          Back to Addresses
        </Button>
      </div>

      {isLoading && <Skeleton className="h-64 w-full max-w-2xl" />}

      {error && (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Failed to load"}
        </p>
      )}

      {data && (
        <div className="flex flex-col gap-4 max-w-4xl">
          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-lg border bg-card p-6">
              <div className="mb-4 flex items-center gap-2">
                <MapPinIcon className="size-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold">Location</h2>
              </div>
              <dl className="space-y-3 text-sm">
                <Field label="ID">
                  <span className="font-mono">{data.id}</span>
                </Field>
                <Field label="Name">
                  <span className="font-medium">{data.name}</span>
                </Field>
                <Field label="Address">
                  <span className="text-muted-foreground">{data.address}</span>
                </Field>
                <Field label="Latitude">
                  <span className="font-mono text-xs">{data.latitude}</span>
                </Field>
                <Field label="Longitude">
                  <span className="font-mono text-xs">{data.longitude}</span>
                </Field>
                <Field label="Created">
                  <span className="text-xs text-muted-foreground">
                    {new Date(data.created_at).toLocaleString("en-US")}
                  </span>
                </Field>
                <Field label="Updated">
                  <span className="text-xs text-muted-foreground">
                    {new Date(data.updated_at).toLocaleString("en-US")}
                  </span>
                </Field>
              </dl>
            </section>

            <section className="rounded-lg border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDriveIcon className="size-5 text-muted-foreground" />
                  <h2 className="text-lg font-semibold">
                    Devices
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      ({data.devices?.length ?? 0})
                    </span>
                  </h2>
                </div>
                {canCreate && (
                  <Button size="sm" onClick={() => setShowForm(true)}>
                    <PlusIcon />
                    Add Device
                  </Button>
                )}
              </div>

              {!data.devices || data.devices.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No devices placed at this address.
                </p>
              ) : (
                <ul className="divide-y">
                  {data.devices.map((d, i) => (
                    <li
                      key={d.id ?? `${d.name}-${i}`}
                      className="flex items-center justify-between py-3"
                    >
                      <div>
                        <p className="font-medium">{d.name}</p>
                        {d.device_code && (
                          <p className="font-mono text-xs text-muted-foreground">
                            {d.device_code}
                          </p>
                        )}
                      </div>
                      <Badge variant={statusVariant(d.status)}>{d.status}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          {isAdmin && (
            <div className="w-full">
              {isStatsLoading ? (
                <Skeleton className="h-[350px] w-full rounded-xl" />
              ) : (
                <ChartAreaInteractive data={statsData} />
              )}
            </div>
          )}
        </div>
      )}

      <Sheet open={showForm} onOpenChange={setShowForm}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>New Device</SheetTitle>
            <SheetDescription>
              Device will be placed at{" "}
              <span className="font-medium">{data?.name ?? "this address"}</span>
              .
            </SheetDescription>
          </SheetHeader>
          <form
            onSubmit={handleCreateDevice}
            className="flex flex-1 flex-col gap-4 px-4"
          >
            <div className="grid gap-2">
              <Label htmlFor="device-name">Name</Label>
              <Input
                id="device-name"
                name="name"
                required
                placeholder="Dispenser Lantai 1"
              />
            </div>
            <SheetFooter className="mt-auto flex-row justify-end gap-2 px-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createDevice.isPending}>
                {createDevice.isPending ? "Creating..." : "Create"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  )
}
