"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useAddress } from "@/hooks/use-addresses";
import { useCreateDevice } from "@/hooks/use-devices";
import { useTransactionStats } from "@/hooks/use-transactions";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import type { DeviceInput } from "@/lib/devices";
import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  ArrowLeftIcon,
  MapPinIcon,
  HardDriveIcon,
  PlusIcon,
} from "lucide-react";

function statusDeviceStyle(status_device: string) {
  const s = status_device?.toUpperCase();
  if (s === "ACTIVE") {
    return "border-green-500/40 bg-green-500/15 text-green-700 dark:text-green-400";
  }
  if (s === "INACTIVE") {
    return "border-red-500/40 bg-red-500/15 text-red-700 dark:text-red-400";
  }
  return "";
}

export function AddressDetail({ id }: { id: number }) {
  const { data, isLoading, error, refetch } = useAddress(id);
  const { hasPermission, isRole } = useAuth();
  const isAdmin = isRole("super-admin");
  const canCreate = hasPermission("devices.create");
  const createDevice = useCreateDevice();
  const [showForm, setShowForm] = React.useState(false);
  const [newDeviceToken, setNewDeviceToken] = React.useState<string | null>(
    null,
  );
  const [newDeviceName, setNewDeviceName] = React.useState<string>("");

  const { data: statsData, isLoading: isStatsLoading } = useTransactionStats(
    "daily",
    id,
    isAdmin,
  );

  async function handleCreateDevice(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = (fd.get("name") as string).trim();
    const payload: DeviceInput = {
      name,
      address_id: id,
    };

    try {
      const res = await createDevice.mutateAsync(payload);
      toast.success("Device created");
      setShowForm(false);
      refetch();
      if (res?.raw_device_token) {
        setNewDeviceName(name);
        setNewDeviceToken(res.raw_device_token);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create");
    }
  }

  if (Number.isNaN(id) || !Number.isFinite(id)) {
    return (
      <div className="px-4 lg:px-6">
        <p className="text-sm text-destructive">Invalid address id.</p>
      </div>
    );
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
        <div className="flex flex-col gap-4">
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
                      <Badge
                        variant="outline"
                        className={statusDeviceStyle(d.status_device)}
                      >
                        {d.status_device}
                      </Badge>
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
              <span className="font-medium">
                {data?.name ?? "this address"}
              </span>
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

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right">{children}</dd>
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
