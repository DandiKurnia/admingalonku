"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  useDevices,
  useDevice,
  useCreateDevice,
  useUpdateDevice,
  useDeleteDevice,
} from "@/hooks/use-devices"
import { useAddresses } from "@/hooks/use-addresses"
import type { Device } from "@/lib/types"
import type { DeviceInput } from "@/lib/devices"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
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
import {
  PlusIcon,
  PencilIcon,
  Trash2Icon,
  HardDriveIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"

const PAGE_SIZE = 10

type FormMode =
  | { type: "closed" }
  | { type: "create" }
  | { type: "edit"; device: Device }

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

function statusVariant(status: string) {
  const s = status?.toUpperCase()
  if (s === "ACTIVE") return "default"
  if (s === "INACTIVE") return "secondary"
  return "outline"
}

export function DeviceList() {
  const { hasPermission } = useAuth()
  const canCreate = hasPermission("devices.create")
  const canUpdate = hasPermission("devices.update")
  const canDelete = hasPermission("devices.delete")

  const { data, isLoading, error } = useDevices()
  const [mode, setMode] = React.useState<FormMode>({ type: "closed" })
  const [deleteId, setDeleteId] = React.useState<number | null>(null)
  const [previewQr, setPreviewQr] = React.useState<Device | null>(null)
  const [openId, setOpenId] = React.useState<number | null>(null)
  const [page, setPage] = React.useState(1)
  const deleteMutation = useDeleteDevice()

  const total = data?.length ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * PAGE_SIZE
  const pageRows = React.useMemo(
    () => (data ?? []).slice(start, start + PAGE_SIZE),
    [data, start]
  )

  React.useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  async function handleDelete() {
    if (deleteId == null) return
    try {
      await deleteMutation.mutateAsync(deleteId)
      toast.success("Device deleted")
      setDeleteId(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete")
    }
  }

  return (
    <div className="px-4 lg:px-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Devices</h2>
          <p className="text-sm text-muted-foreground">
            Smart dispenser units and their QR codes.
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => setMode({ type: "create" })}>
            <PlusIcon />
            New Device
          </Button>
        )}
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">No</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead>QR</TableHead>
              <TableHead className="w-32 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              [0, 1, 2].map((i) => (
                <TableRow key={i}>
                  <TableCell colSpan={7}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))}
            {error && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-8 text-center text-sm text-destructive"
                >
                  {error instanceof Error ? error.message : "Failed to load"}
                </TableCell>
              </TableRow>
            )}
            {!isLoading && total === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  <HardDriveIcon className="mx-auto mb-2 size-6 opacity-50" />
                  No devices yet.
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
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell className="font-mono text-xs">
                  {row.device_code}
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant(row.status)}>
                    {row.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {row.last_active
                    ? new Date(row.last_active).toLocaleString("en-US")
                    : "—"}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  {row.qr_code_url ? (
                    <button
                      type="button"
                      onClick={() => setPreviewQr(row)}
                      className="text-xs text-primary underline-offset-2 hover:underline"
                    >
                      View
                    </button>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell
                  className="text-right"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-end gap-1">
                    {canUpdate && (
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => setMode({ type: "edit", device: row })}
                        aria-label="Edit"
                      >
                        <PencilIcon />
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => setDeleteId(row.id)}
                        aria-label="Delete"
                      >
                        <Trash2Icon />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {total > 0 && (
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Showing {total === 0 ? 0 : start + 1}–
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

      <DeviceFormSheet
        mode={mode}
        onClose={() => setMode({ type: "closed" })}
      />

      <DeviceDetailSheet id={openId} onClose={() => setOpenId(null)} />

      <Sheet
        open={previewQr !== null}
        onOpenChange={(open) => !open && setPreviewQr(null)}
      >
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>QR Code</SheetTitle>
            <SheetDescription>
              {previewQr?.name} — <span className="font-mono">{previewQr?.device_code}</span>
            </SheetDescription>
          </SheetHeader>
          {previewQr && (
            <div className="flex items-center justify-center px-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${API_URL}${previewQr.qr_code_url}`}
                alt="QR"
                className="h-64 w-64 rounded-md border bg-white p-2 object-contain"
              />
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Sheet
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Delete device?</SheetTitle>
            <SheetDescription>
              This action cannot be undone.
            </SheetDescription>
          </SheetHeader>
          <SheetFooter className="flex-row justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}

function DeviceFormSheet({
  mode,
  onClose,
}: {
  mode: FormMode
  onClose: () => void
}) {
  const create = useCreateDevice()
  const update = useUpdateDevice()
  const { data: addresses } = useAddresses()
  const isOpen = mode.type !== "closed"
  const isEdit = mode.type === "edit"
  const initial = mode.type === "edit" ? mode.device : null

  const [addressId, setAddressId] = React.useState<string>(
    initial?.address_id ? String(initial.address_id) : ""
  )

  React.useEffect(() => {
    setAddressId(initial?.address_id ? String(initial.address_id) : "")
  }, [initial?.address_id, mode.type])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const name = (fd.get("name") as string).trim()
    const idStr = addressId

    if (!idStr) {
      toast.error("Please pick an address")
      return
    }

    const payload: DeviceInput = {
      name,
      address_id: Number(idStr),
    }

    try {
      if (mode.type === "edit") {
        await update.mutateAsync({ id: mode.device.id, input: payload })
        toast.success("Device updated")
      } else if (mode.type === "create") {
        await create.mutateAsync(payload)
        toast.success("Device created")
      }
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save")
    }
  }

  const pending = create.isPending || update.isPending

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit Device" : "New Device"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Update the device name or location."
              : "Register a new dispenser unit. QR Code will be generated."}
          </SheetDescription>
        </SheetHeader>
        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col gap-4 px-4"
          key={initial?.id ?? "new"}
        >
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              required
              defaultValue={initial?.name ?? ""}
              placeholder="Dispenser Lantai 1"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="address_id">Address</Label>
            <Select
              value={addressId}
              onValueChange={(v) => setAddressId(v ?? "")}
            >
              <SelectTrigger id="address_id" className="w-full">
                <SelectValue placeholder="Pick an address" />
              </SelectTrigger>
              <SelectContent>
                {addresses?.map((a) => (
                  <SelectItem key={a.id} value={String(a.id)}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <SheetFooter className="mt-auto flex-row justify-end gap-2 px-0">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : isEdit ? "Update" : "Create"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

function DeviceDetailSheet({
  id,
  onClose,
}: {
  id: number | null
  onClose: () => void
}) {
  const { data, isLoading, error } = useDevice(id ?? -1)

  return (
    <Sheet open={id !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Device Detail</SheetTitle>
          <SheetDescription>
            {data ? data.name : `#${id}`}
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
              <div className="rounded-md border p-3">
                <h3 className="mb-2 text-sm font-semibold">Device</h3>
                <div className="space-y-1.5 text-sm">
                  <Row k="Name" v={data.name} />
                  <Row
                    k="Code"
                    v={<span className="font-mono">{data.device_code}</span>}
                  />
                  <Row
                    k="Status"
                    v={
                      <Badge variant={statusVariant(data.status)}>
                        {data.status}
                      </Badge>
                    }
                  />
                  <Row
                    k="Last Active"
                    v={
                      data.last_active
                        ? new Date(data.last_active).toLocaleString("en-US")
                        : "—"
                    }
                  />
                  <Row
                    k="Created"
                    v={new Date(data.created_at).toLocaleString("en-US")}
                  />
                </div>
              </div>

              <div className="rounded-md border p-3">
                <h3 className="mb-2 text-sm font-semibold">Address</h3>
                {data.address ? (
                  <div className="space-y-1.5 text-sm">
                    <Row k="Name" v={data.address.name} />
                    <Row k="Address" v={data.address.address} />
                    <Row
                      k="Coordinates"
                      v={
                        <span className="font-mono text-xs">
                          {data.address.latitude?.toFixed(4)},{" "}
                          {data.address.longitude?.toFixed(4)}
                        </span>
                      }
                    />
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Address ID: {data.address_id} (relation not loaded)
                  </p>
                )}
              </div>

              {data.qr_code_url && (
                <div className="rounded-md border p-3">
                  <h3 className="mb-2 text-sm font-semibold">QR Code</h3>
                  <div className="flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`${API_URL}${data.qr_code_url}`}
                      alt="QR"
                      className="h-48 w-48 rounded-md border bg-white p-2 object-contain"
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{k}</span>
      <span className="text-right">{v}</span>
    </div>
  )
}
