"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  useAddresses,
  useCreateAddress,
  useUpdateAddress,
  useDeleteAddress,
} from "@/hooks/use-addresses"
import type { Address } from "@/lib/types"
import type { AddressInput } from "@/lib/addresses"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  MapPinIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"

const PAGE_SIZE = 10

type FormMode =
  | { type: "closed" }
  | { type: "create" }
  | { type: "edit"; address: Address }

export function AddressList() {
  const router = useRouter()
  const { hasPermission } = useAuth()
  const canCreate = hasPermission("addresses.create")
  const canUpdate = hasPermission("addresses.update")
  const canDelete = hasPermission("addresses.delete")

  const { data, isLoading, error } = useAddresses()
  const [mode, setMode] = React.useState<FormMode>({ type: "closed" })
  const [deleteId, setDeleteId] = React.useState<number | null>(null)
  const [page, setPage] = React.useState(1)
  const deleteMutation = useDeleteAddress()

  const total = data?.length ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * PAGE_SIZE
  const pageRows = React.useMemo(
    () => (data ?? []).slice(start, start + PAGE_SIZE),
    [data, start]
  )

  if (page > totalPages) {
    // Schedule the correction after render to avoid cascading renders
    React.startTransition(() => setPage(totalPages))
  }

  async function handleDelete() {
    if (deleteId == null) return
    try {
      await deleteMutation.mutateAsync(deleteId)
      toast.success("Address deleted")
      setDeleteId(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete")
    }
  }

  return (
    <div className="px-4 lg:px-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Addresses</h2>
          <p className="text-sm text-muted-foreground">
            Manage dispenser placement locations.
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => setMode({ type: "create" })}>
            <PlusIcon />
            New Address
          </Button>
        )}
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">No</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Coordinates</TableHead>
              <TableHead className="w-32 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <>
                {[0, 1, 2].map((i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  </TableRow>
                ))}
              </>
            )}
            {error && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-sm text-destructive"
                >
                  {error instanceof Error ? error.message : "Failed to load"}
                </TableCell>
              </TableRow>
            )}
            {!isLoading && total === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  <MapPinIcon className="mx-auto mb-2 size-6 opacity-50" />
                  No addresses yet.
                </TableCell>
              </TableRow>
            )}
            {pageRows.map((row, index) => (
              <TableRow
                key={row.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => router.push(`/addresses/${row.id}`)}
              >
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {start + index + 1}
                </TableCell>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {row.address}
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {row.latitude?.toFixed(4)}, {row.longitude?.toFixed(4)}
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
                        onClick={() =>
                          setMode({ type: "edit", address: row })
                        }
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

      <AddressFormSheet
        mode={mode}
        onClose={() => setMode({ type: "closed" })}
      />

      <Sheet
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Delete address?</SheetTitle>
            <SheetDescription>
              This action cannot be undone. The address will be permanently
              removed.
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

function AddressFormSheet({
  mode,
  onClose,
}: {
  mode: FormMode
  onClose: () => void
}) {
  const create = useCreateAddress()
  const update = useUpdateAddress()
  const isOpen = mode.type !== "closed"
  const isEdit = mode.type === "edit"
  const initial = mode.type === "edit" ? mode.address : null

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const lat = fd.get("latitude") as string
    const lng = fd.get("longitude") as string

    const payload: AddressInput = {
      name: (fd.get("name") as string).trim(),
      address: (fd.get("address") as string).trim(),
      latitude: lat ? Number(lat) : undefined,
      longitude: lng ? Number(lng) : undefined,
    }

    try {
      if (mode.type === "edit") {
        await update.mutateAsync({ id: mode.address.id, input: payload })
        toast.success("Address updated")
      } else if (mode.type === "create") {
        await create.mutateAsync(payload)
        toast.success("Address created")
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
          <SheetTitle>{isEdit ? "Edit Address" : "New Address"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Update the address details."
              : "Add a new dispenser placement location."}
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
              placeholder="Stasiun Pondok Cina"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              required
              defaultValue={initial?.address ?? ""}
              placeholder="Jl. Pondok Cina, Beji, Depok"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="grid gap-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                name="latitude"
                type="number"
                step="any"
                min={-90}
                max={90}
                defaultValue={initial?.latitude ?? ""}
                placeholder="-6.3687"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                name="longitude"
                type="number"
                step="any"
                min={-180}
                max={180}
                defaultValue={initial?.longitude ?? ""}
                placeholder="106.8324"
              />
            </div>
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
