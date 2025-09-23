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
  useSidebar, // Import useSidebar hook
} from "@/components/ui/sidebar";
import { useUserContext } from "@/context/UserContext";

// Updated Menu items.
export const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    allowedRoles: ["admin", "barber"],
  },
  {
    title: "Barber Details",
    url: "/barbers",
    icon: Users,
    allowedRoles: ["admin"],
  },
  {
    title: "Client Details",
    url: "/clients",
    icon: Users,
    allowedRoles: ["admin", "barber"],
  },
  {
    title: "Booking Details",
    url: "/bookings",
    icon: CalendarCheck2,
    allowedRoles: ["admin", "barber"],
  },
  {
    title: "Manage Services",
    url: "/add-services",
    icon: Scissors,
    allowedRoles: ["admin"],
  },
  {
    title: "Manage Inventory",
    url: "/inventory",
    icon: Boxes,
    allowedRoles: ["admin", "barber"],
  },
  {
    title: "Manage Report",
    url: "/reports",
    icon: BarChart3,
    allowedRoles: ["admin"],
  },
];

export function AppSidebar() {
  const { user } = useUserContext();
  const { isMobile, setOpenMobile } = useSidebar(); // Get sidebar context

  // Function to handle menu item clicks
  const handleMenuItemClick = () => {
    if (isMobile) {
      setOpenMobile(false); // Close sidebar on mobile
    }
  };

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
                )
                .map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild onClick={handleMenuItemClick}>
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
