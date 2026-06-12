"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  useRoles,
  usePermissions,
  useUpdateRolePermissions,
} from "@/hooks/use-roles"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import type { Permission, Role } from "@/lib/types"
import { ShieldIcon } from "lucide-react"

export function RolesMatrix() {
  const { data: roles, isLoading: rolesLoading, error: rolesError } = useRoles()
  const { data: permissions, isLoading: permsLoading } = usePermissions()

  if (rolesLoading || permsLoading) {
    return (
      <div className="px-4 lg:px-6">
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (rolesError) {
    return (
      <div className="px-4 lg:px-6 text-sm text-destructive">
        {rolesError instanceof Error ? rolesError.message : "Failed to load"}
      </div>
    )
  }

  if (!roles || !permissions) return null

  const firstRole = roles[0]?.id ? String(roles[0].id) : ""

  return (
    <div className="px-4 lg:px-6">
      <div className="mb-4 flex items-center gap-2">
        <ShieldIcon className="size-5" />
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Roles & Permissions
          </h2>
          <p className="text-sm text-muted-foreground">
            Toggle which permissions belong to each role.
          </p>
        </div>
      </div>

      {firstRole && (
        <Tabs defaultValue={firstRole}>
          <TabsList>
            {roles.map((r) => (
              <TabsTrigger key={r.id} value={String(r.id)}>
                {r.name ?? r.key}
              </TabsTrigger>
            ))}
          </TabsList>
          {roles.map((r) => (
            <TabsContent key={r.id} value={String(r.id)}>
              <RoleEditor role={r} allPermissions={permissions} />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  )
}

function RoleEditor({
  role,
  allPermissions,
}: {
  role: Role
  allPermissions: Permission[]
}) {
  const update = useUpdateRolePermissions()

  const initialIds = React.useMemo(
    () => new Set(role.permissions?.map((p) => p.id).filter(Boolean) as number[]),
    [role.permissions]
  )

  const [selected, setSelected] = React.useState<Set<number>>(initialIds)

  React.useEffect(() => {
    setSelected(new Set(initialIds))
  }, [initialIds])

  const grouped = React.useMemo(() => {
    const map = new Map<string, Permission[]>()
    for (const p of allPermissions) {
      const key = p.resource ?? "other"
      const arr = map.get(key) ?? []
      arr.push(p)
      map.set(key, arr)
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [allPermissions])

  function toggle(id: number) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleGroup(perms: Permission[], on: boolean) {
    setSelected((prev) => {
      const next = new Set(prev)
      for (const p of perms) {
        if (!p.id) continue
        if (on) next.add(p.id)
        else next.delete(p.id)
      }
      return next
    })
  }

  async function handleSave() {
    if (!role.id) return
    try {
      await update.mutateAsync({
        id: role.id,
        permission_ids: Array.from(selected),
      })
      toast.success(`${role.name ?? role.key} updated`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save")
    }
  }

  const dirty = !setEquals(selected, initialIds)

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{role.key}</Badge>
          <span className="text-sm text-muted-foreground">
            {selected.size} of {allPermissions.length} permissions
          </span>
        </div>
        <Button onClick={handleSave} disabled={!dirty || update.isPending}>
          {update.isPending ? "Saving..." : "Save changes"}
        </Button>
      </div>

      <div className="grid gap-4 p-4 md:grid-cols-2">
        {grouped.map(([resource, perms]) => {
          const allOn = perms.every((p) => p.id && selected.has(p.id))
          return (
            <div key={resource} className="rounded-md border p-3">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-medium capitalize">
                  {resource.replace(/_/g, " ")}
                </h3>
                <button
                  type="button"
                  className="text-xs text-primary hover:underline"
                  onClick={() => toggleGroup(perms, !allOn)}
                >
                  {allOn ? "Clear" : "Select all"}
                </button>
              </div>
              <div className="space-y-2">
                {perms.map((p) => (
                  <label
                    key={p.id}
                    className="flex cursor-pointer items-start gap-2 text-sm"
                  >
                    <Checkbox
                      checked={p.id ? selected.has(p.id) : false}
                      onCheckedChange={() => p.id && toggle(p.id)}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{p.name ?? p.key}</p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {p.key}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function setEquals(a: Set<number>, b: Set<number>) {
  if (a.size !== b.size) return false
  for (const x of a) if (!b.has(x)) return false
  return true
}
