"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  useDevices,
  useDevice,
  useCreateDevice,
  useUpdateDevice,
  useDeleteDevice,
  useRotateDeviceToken,
  useRevokeDeviceToken,
} from "@/hooks/use-devices";
import { useAddresses } from "@/hooks/use-addresses";
import type { Device } from "@/lib/types";
import type { DeviceInput } from "@/lib/devices";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PlusIcon,
  PencilIcon,
  Trash2Icon,
  HardDriveIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";

const PAGE_SIZE = 10;

type FormMode =
  | { type: "closed" }
  | { type: "create" }
  | { type: "edit"; device: Device };

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

function statusDeviceStyle(status: string) {
  const s = status?.toUpperCase();
  if (s === "ACTIVE") {
    return "border-green-500/40 bg-green-500/15 text-green-700 dark:text-green-400";
  }
  if (s === "INACTIVE") {
    return "border-red-500/40 bg-red-500/15 text-red-700 dark:text-red-400";
  }
  return "";
}

function qrStatusVariant(status: string) {
  const s = status?.toUpperCase();
  if (s === "WAITING") return "secondary";
  if (s === "SCANNED") return "default";
  if (s === "PROCESSING") return "default";
  if (s === "DONE") return "default";
  return "outline";
}

export function DeviceList() {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission("devices.create");
  const canUpdate = hasPermission("devices.update");
  const canDelete = hasPermission("devices.delete");

  const { data, isLoading, error } = useDevices();
  const [mode, setMode] = React.useState<FormMode>({ type: "closed" });
  const [deleteId, setDeleteId] = React.useState<number | null>(null);
  const [previewQr, setPreviewQr] = React.useState<Device | null>(null);
  const [openId, setOpenId] = React.useState<number | null>(null);
  const [newDeviceToken, setNewDeviceToken] = React.useState<string | null>(null);
  const [newDeviceName, setNewDeviceName] = React.useState<string>("");
  const [page, setPage] = React.useState(1);
  const deleteMutation = useDeleteDevice();

  const total = data?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const pageRows = React.useMemo(
    () => (data ?? []).slice(start, start + PAGE_SIZE),
    [data, start],
  );

  const [prevTotalPages, setPrevTotalPages] = React.useState(totalPages);
  if (totalPages !== prevTotalPages) {
    setPrevTotalPages(totalPages);
    setPage((p) => Math.min(p, totalPages));
  }

  async function handleDelete() {
    if (deleteId == null) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success("Device deleted");
      setDeleteId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
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
              <TableHead>Device Status</TableHead>
              <TableHead>QR Status</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead>QR</TableHead>
              <TableHead className="w-32 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              [0, 1, 2].map((i) => (
                <TableRow key={i}>
                  <TableCell colSpan={8}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))}
            {error && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-8 text-center text-sm text-destructive"
                >
                  {error instanceof Error ? error.message : "Failed to load"}
                </TableCell>
              </TableRow>
            )}
            {!isLoading && total === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
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
                  <Badge
                    variant="outline"
                    className={statusDeviceStyle(row.status_device)}
                  >
                    {row.status_device}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={qrStatusVariant(row.qr_status)}>
                    {row.qr_status}
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
        key={
          mode.type === "edit"
            ? `edit-${mode.device.id}`
            : mode.type === "create"
              ? "create"
              : "closed"
        }
        mode={mode}
        onClose={() => setMode({ type: "closed" })}
        onCreated={(name, token) => {
          setNewDeviceName(name);
          setNewDeviceToken(token);
        }}
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
              {previewQr?.name} —{" "}
              <span className="font-mono">{previewQr?.device_code}</span>
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
            <SheetDescription>This action cannot be undone.</SheetDescription>
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

      <NewDeviceTokenAlert
        token={newDeviceToken}
        deviceName={newDeviceName}
        onClose={() => {
          setNewDeviceToken(null);
          setNewDeviceName("");
        }}
      />
    </div>
  );
}

function DeviceFormSheet({
  mode,
  onClose,
  onCreated,
}: {
  mode: FormMode;
  onClose: () => void;
  onCreated: (name: string, token: string) => void;
}) {
  const create = useCreateDevice();
  const update = useUpdateDevice();
  const { data: addresses } = useAddresses();
  const isOpen = mode.type !== "closed";
  const isEdit = mode.type === "edit";
  const initial = mode.type === "edit" ? mode.device : null;

  const [addressId, setAddressId] = React.useState<string>(
    initial?.address_id ? String(initial.address_id) : "",
  );
  const [statusDevice, setStatusDevice] = React.useState<"ACTIVE" | "INACTIVE">(
    (initial?.status_device?.toUpperCase() as "ACTIVE" | "INACTIVE") || "ACTIVE",
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = (fd.get("name") as string).trim();
    const idStr = addressId;

    if (!idStr) {
      toast.error("Please pick an address");
      return;
    }

    const payload: DeviceInput = {
      name,
      address_id: Number(idStr),
      status_device: statusDevice,
    };

    try {
      if (mode.type === "edit") {
        await update.mutateAsync({ id: mode.device.id, input: payload });
        toast.success("Device updated");
        onClose();
      } else if (mode.type === "create") {
        const res = await create.mutateAsync(payload);
        toast.success("Device created");
        if (res?.raw_device_token) {
          onCreated(name, res.raw_device_token);
        }
        onClose();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    }
  }

  const pending = create.isPending || update.isPending;

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
          <div className="grid gap-2">
            <Label htmlFor="status_device">Status</Label>
            <Select
              value={statusDevice}
              onValueChange={(v) =>
                setStatusDevice((v as "ACTIVE" | "INACTIVE") ?? "ACTIVE")
              }
            >
              <SelectTrigger id="status_device" className="w-full">
                <SelectValue placeholder="Pick a status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Inactive devices cannot dispense water.
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
  );
}

function DeviceDetailSheet({
  id,
  onClose,
}: {
  id: number | null;
  onClose: () => void;
}) {
  const { data, isLoading, error } = useDevice(id ?? -1);
  const rotateToken = useRotateDeviceToken();
  const revokeToken = useRevokeDeviceToken();
  const [rotateResult, setRotateResult] = React.useState<string | null>(null);
  const { hasPermission } = useAuth();
  const canManageToken = hasPermission("devices.update");

  async function handleRotate() {
    if (id == null) return;
    try {
      const res = await rotateToken.mutateAsync(id);
      setRotateResult(res.raw_device_token);
      toast.success(
        "Token rotated. Store it securely — it won't be shown again.",
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to rotate token",
      );
    }
  }

  async function handleRevoke() {
    if (id == null) return;
    try {
      await revokeToken.mutateAsync(id);
      toast.success("Token revoked");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to revoke token",
      );
    }
  }

  const [prevId, setPrevId] = React.useState(id);
  if (id !== prevId) {
    setPrevId(id);
    setRotateResult(null);
  }

  return (
    <Sheet open={id !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Device Detail</SheetTitle>
          <SheetDescription>{data ? data.name : `#${id}`}</SheetDescription>
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
                    k="Device Status"
                    v={
                      <Badge
                        variant="outline"
                        className={statusDeviceStyle(data.status_device)}
                      >
                        {data.status_device}
                      </Badge>
                    }
                  />
                  <Row
                    k="QR Status"
                    v={
                      <Badge variant={qrStatusVariant(data.qr_status)}>
                        {data.qr_status}
                      </Badge>
                    }
                  />
                  <Row
                    k="Token Issued"
                    v={
                      data.token_issued_at
                        ? new Date(data.token_issued_at).toLocaleString("en-US")
                        : "—"
                    }
                  />
                  <Row
                    k="Token Revoked"
                    v={
                      data.token_revoked_at ? (
                        <span className="text-destructive">
                          {new Date(data.token_revoked_at).toLocaleString(
                            "en-US",
                          )}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )
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

              {canManageToken && (
                <div className="rounded-md border p-3">
                  <h3 className="mb-2 text-sm font-semibold">Device Token</h3>
                  <p className="mb-3 text-xs text-muted-foreground">
                    Rotate to issue a new token (old token immediately invalid).
                    Revoke to block ESP32 from polling without rotating.
                  </p>
                  {rotateResult && (
                    <div className="mb-3 rounded-md border border-amber-500/40 bg-amber-500/10 p-2">
                      <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                        New token (copy now, will not be shown again):
                      </p>
                      <code className="mt-1 block break-all font-mono text-xs">
                        {rotateResult}
                      </code>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleRotate}
                      disabled={rotateToken.isPending}
                    >
                      {rotateToken.isPending ? "Rotating..." : "Rotate Token"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleRevoke}
                      disabled={revokeToken.isPending}
                    >
                      {revokeToken.isPending ? "Revoking..." : "Revoke Token"}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{k}</span>
      <span className="text-right">{v}</span>
    </div>
  );
}

function NewDeviceTokenAlert({
  token,
  deviceName,
  onClose,
}: {
  token: string | null;
  deviceName: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = React.useState(false);
  const [prevToken, setPrevToken] = React.useState(token);
  if (token !== prevToken) {
    setPrevToken(token);
    setCopied(false);
  }

  async function handleCopy() {
    if (!token) return;
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      toast.success("Token copied to clipboard");
    } catch {
      toast.error("Failed to copy. Please select and copy manually.");
    }
  }

  return (
    <Sheet
      open={token !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      disablePointerDismissal
    >
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Save the device token</SheetTitle>
          <SheetDescription>
            This is the only time the token for{" "}
            <span className="font-medium">{deviceName || "this device"}</span>{" "}
            will be shown. Copy it now and provision it to the ESP32 before
            closing this dialog.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-4 pb-4">
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <p className="mb-2 text-xs font-semibold text-amber-700 dark:text-amber-400">
              Device Token
            </p>
            <code className="block break-all rounded bg-background/60 p-2 font-mono text-xs">
              {token}
            </code>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleCopy}
              className="mt-2 w-full"
            >
              {copied ? "Copied!" : "Copy Token"}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Provision this token to the ESP32 firmware. If you lose it, you
            must rotate the token from the device detail.
          </p>
        </div>

        <SheetFooter className="flex-row justify-end gap-2 px-4">
          <Button onClick={onClose} disabled={!copied}>
            {copied ? "I've saved it — close" : "Copy token first"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
