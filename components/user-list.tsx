"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  useUsers,
  useRegisterUser,
  useUpdateUser,
} from "@/hooks/use-users"
import { useRoles } from "@/hooks/use-roles"
import { useAddresses } from "@/hooks/use-addresses"
import type { User } from "@/lib/types"
import type { RegisterUserInput, UpdateUserInput } from "@/lib/users"
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
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { PlusIcon, PencilIcon, UsersIcon } from "lucide-react"

const PAGE_SIZE = 10
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

type FormMode =
  | { type: "closed" }
  | { type: "create" }
  | { type: "edit"; user: User }

function avatarUrl(path?: string | null) {
  if (!path) return ""
  if (path.startsWith("http")) return path
  return `${API_URL}/${path.replace(/^\/+/, "")}`
}

function initials(name?: string) {
  if (!name) return "?"
  return name
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function UserList() {
  const { data, isLoading, error } = useUsers()
  const [mode, setMode] = React.useState<FormMode>({ type: "closed" })
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
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UsersIcon className="size-5" />
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Users</h2>
            <p className="text-sm text-muted-foreground">
              Manage operator and admin accounts.
            </p>
          </div>
        </div>
        <Button onClick={() => setMode({ type: "create" })}>
          <PlusIcon />
          New User
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">No</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="w-20 text-right">Action</TableHead>
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
            {!isLoading && total === 0 && !error && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  <UsersIcon className="mx-auto mb-2 size-6 opacity-50" />
                  No users yet.
                </TableCell>
              </TableRow>
            )}
            {pageRows.map((row, index) => (
              <TableRow key={row.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {start + index + 1}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      <AvatarImage
                        src={avatarUrl(row.avatar)}
                        alt={row.name}
                      />
                      <AvatarFallback>{initials(row.name)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{row.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {row.email}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {row.phone_number || "—"}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {row.role?.name ?? row.role?.key ?? "—"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => setMode({ type: "edit", user: row })}
                    aria-label="Edit"
                  >
                    <PencilIcon />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {total > 0 && (
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Showing {start + 1}–{Math.min(start + PAGE_SIZE, total)} of {total}
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
            >
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
            </Button>
          </div>
        </div>
      )}

      <UserFormSheet
        mode={mode}
        onClose={() => setMode({ type: "closed" })}
      />
    </div>
  )
}

function UserFormSheet({
  mode,
  onClose,
}: {
  mode: FormMode
  onClose: () => void
}) {
  const isOpen = mode.type !== "closed"
  const isEdit = mode.type === "edit"
  const initial = mode.type === "edit" ? mode.user : null

  const register = useRegisterUser()
  const update = useUpdateUser()
  const { data: roles } = useRoles()
  const { data: addresses } = useAddresses()

  const [roleId, setRoleId] = React.useState<string>(
    initial?.role_id ? String(initial.role_id) : ""
  )
  const [addressId, setAddressId] = React.useState<string>(
    initial?.address_id ? String(initial.address_id) : ""
  )

  // Sync form state when mode/initial changes — legitimate prop-to-state sync
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing form with external props
    setRoleId(initial?.role_id ? String(initial.role_id) : "")
    setAddressId(initial?.address_id ? String(initial.address_id) : "")
  }, [initial?.role_id, initial?.address_id, mode.type])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const name = (fd.get("name") as string).trim()
    const email = (fd.get("email") as string).trim()
    const phone = (fd.get("phone_number") as string).trim()
    const password = (fd.get("password") as string).trim()

    try {
      if (mode.type === "create") {
        const rId = Number(roleId)
        if (!Number.isFinite(rId) || rId <= 0) {
          toast.error("Please pick a valid role")
          return
        }
        const payload: RegisterUserInput = {
          name,
          email,
          password,
          phone_number: phone,
          roleId: rId,
          ...(addressId ? { addressId: Number(addressId) } : {}),
        }
        await register.mutateAsync(payload)
        toast.success("User created")
      } else if (mode.type === "edit") {
        const payload: UpdateUserInput = {
          name,
          email,
          ...(phone ? { phone_number: phone } : {}),
          ...(password ? { password } : {}),
          ...(roleId ? { role_id: Number(roleId) } : {}),
          address_id: addressId ? Number(addressId) : null,
        }
        await update.mutateAsync({ id: mode.user.id, input: payload })
        toast.success("User updated")
      }
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save")
    }
  }

  const pending = register.isPending || update.isPending

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit User" : "New User"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Update user details. Leave password blank to keep current."
              : "Register a new account. Role is required; address is optional."}
          </SheetDescription>
        </SheetHeader>
        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col gap-4 px-4 pb-4"
          key={initial?.id ?? "new"}
        >
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              required
              minLength={1}
              defaultValue={initial?.name ?? ""}
              placeholder="Operator Name"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              defaultValue={initial?.email ?? ""}
              placeholder="operator@mail.com"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone_number">Phone</Label>
            <Input
              id="phone_number"
              name="phone_number"
              required={!isEdit}
              inputMode="numeric"
              minLength={10}
              maxLength={15}
              defaultValue={initial?.phone_number ?? ""}
              placeholder="081234567890"
            />
            <p className="text-xs text-muted-foreground">10–15 digits.</p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">
              {isEdit ? "New Password (optional)" : "Password"}
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              required={!isEdit}
              minLength={8}
              maxLength={20}
              placeholder={isEdit ? "Leave blank to keep current" : "8–20 chars"}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="role">Role</Label>
            <Select value={roleId} onValueChange={(v) => setRoleId(v ?? "")}>
              <SelectTrigger id="role" className="w-full">
                <SelectValue placeholder="Pick a role" />
              </SelectTrigger>
              <SelectContent>
                {roles
                  ?.filter(
                    (r) => r.key !== "customer" && r.key !== "Customer"
                  )
                  .map((r) => (
                    <SelectItem
                      key={r.id ?? r.key}
                      value={String(r.id ?? "")}
                    >
                      {r.name ?? r.key}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {roles && (
              <p className="text-xs text-muted-foreground">
                Available roles:{" "}
                {roles.map((r) => `${r.name ?? r.key} (${r.id})`).join(", ")}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="address">Address Access</Label>
            <Select
              value={addressId}
              onValueChange={(v) => setAddressId(v ?? "")}
            >
              <SelectTrigger id="address" className="w-full">
                <SelectValue placeholder="Pick an address (optional)" />
              </SelectTrigger>
              <SelectContent>
                {addresses?.map((a) => (
                  <SelectItem key={a.id} value={String(a.id)}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Limits which devices an operator can see.
            </p>
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
