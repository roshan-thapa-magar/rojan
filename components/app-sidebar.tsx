import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  CalendarCheck2,
  Scissors,
  Boxes,
  BarChart3,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useUserContext } from "@/context/UserContext";

// Updated Menu items.
export const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    allowedRoles: ["admin", "barber"], // both
  },
  {
    title: "Barber Details",
    url: "/barbers",
    icon: Users,
    allowedRoles: ["admin"], // only admin
  },
  {
    title: "Client Details",
    url: "/clients",
    icon: Users,
    allowedRoles: ["admin", "barber"], // both
  },
  {
    title: "Booking Details",
    url: "/bookings",
    icon: CalendarCheck2,
    allowedRoles: ["admin", "barber"], // both
  },
  {
    title: "Manage Services",
    url: "/add-services",
    icon: Scissors,
    allowedRoles: ["admin"], // only admin
  },
  {
    title: "Manage Inventory",
    url: "/inventory",
    icon: Boxes,
    allowedRoles: ["admin", "barber"], // both
  },
  {
    title: "Manage Report",
    url: "/reports",
    icon: BarChart3,
    allowedRoles: ["admin"], // only admin
  },
];

export function AppSidebar() {
  const { user } = useUserContext();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{user?.role}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items
                .filter(
                  (item) => user?.role && item.allowedRoles.includes(user.role)
                ) // filter by role
                .map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
