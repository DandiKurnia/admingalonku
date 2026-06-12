"use client"

import * as React from "react"
import { toast } from "sonner"
import { useProfile, useUpdateProfile } from "@/hooks/use-profile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

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

export function ProfileForm() {
  const { data: user, isLoading, error } = useProfile()
  const update = useUpdateProfile()

  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="px-4 lg:px-6">
        <Skeleton className="h-64 w-full max-w-2xl" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-4 lg:px-6 text-sm text-destructive">
        {error instanceof Error ? error.message : "Failed to load"}
      </div>
    )
  }

  if (!user) return null

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!user) return
    const fd = new FormData(e.currentTarget)

    // strip empty fields so backend treats as no-op
    for (const key of Array.from(fd.keys())) {
      const v = fd.get(key)
      if (typeof v === "string" && v.trim() === "") fd.delete(key)
      if (v instanceof File && v.size === 0) fd.delete(key)
    }

    try {
      await update.mutateAsync(fd)
      toast.success("Profile updated")
      setAvatarPreview(null)
      ;(e.target as HTMLFormElement).reset()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update")
    }
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return setAvatarPreview(null)
    const reader = new FileReader()
    reader.onload = () => setAvatarPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div className="px-4 lg:px-6">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold tracking-tight">Profile</h2>
        <p className="text-sm text-muted-foreground">
          Update your account information.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex max-w-2xl flex-col gap-6 rounded-lg border bg-card p-6"
      >
        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarImage
              src={avatarPreview ?? avatarUrl(user.avatar)}
              alt={user.name}
            />
            <AvatarFallback>{initials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-medium">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            {user.role && (
              <Badge variant="secondary" className="mt-1">
                {user.role.name ?? user.role.key}
              </Badge>
            )}
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="avatar">Avatar</Label>
          <Input
            id="avatar"
            name="avatar"
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp,image/avif"
            onChange={handleAvatarChange}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            defaultValue={user.name}
            placeholder="Your name"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={user.email}
            placeholder="you@example.com"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="phone_number">Phone Number</Label>
          <Input
            id="phone_number"
            name="phone_number"
            defaultValue={user.phone_number ?? ""}
            placeholder="08xxxxxxxxxx"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="password">New Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Leave blank to keep current"
            minLength={8}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </form>
    </div>
  )
}
