"use client"

import * as React from "react"
import { useAuth } from "@/lib/auth-context"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  LayoutDashboardIcon,
  HardDriveIcon,
  MapPinIcon,
  ReceiptIcon,
  UsersIcon,
  ShieldIcon,
  Settings2Icon,
  CircleHelpIcon,
  DropletIcon,
} from "lucide-react"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, hasPermission, isRole } = useAuth()

  const navMain = React.useMemo(() => {
    const items: { title: string; url: string; icon: React.ReactNode }[] = [
      {
        title: "Dashboard",
        url: "/",
        icon: <LayoutDashboardIcon />,
      },
    ]

    if (hasPermission("devices.read")) {
      items.push({
        title: "Devices",
        url: "/devices",
        icon: <HardDriveIcon />,
      })
    }

    if (hasPermission("addresses.read") && isRole("super-admin")) {
      items.push({
        title: "Addresses",
        url: "/addresses",
        icon: <MapPinIcon />,
      })
    }

    if (hasPermission("transactions.read")) {
      items.push({
        title: "Transactions",
        url: "/transactions",
        icon: <ReceiptIcon />,
      })
    }

    if (hasPermission("water_fill_logs.read")) {
      items.push({
        title: "Water Fill Logs",
        url: "/water-fill-logs",
        icon: <DropletIcon />,
      })
    }

    if (isRole("super-admin")) {
      items.push({
        title: "Users",
        url: "/users",
        icon: <UsersIcon />,
      })
      items.push({
        title: "Roles & Permissions",
        url: "/roles",
        icon: <ShieldIcon />,
      })
    }

    return items
  }, [hasPermission, isRole])

  const navSecondary = [
    {
      title: "Settings",
      url: "/settings",
      icon: <Settings2Icon />,
    },
    {
      title: "Help",
      url: "/help",
      icon: <CircleHelpIcon />,
    },
  ]

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <DropletIcon className="size-5!" />
              <span className="text-base font-semibold">GalonKu Admin</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: user?.name || "User",
            email: user?.email || "",
            avatar: user?.avatar || "",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  )
}
