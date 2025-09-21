"use client";

import * as React from "react";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function NotificationDropdown() {
  // Example notifications (can come from props, API, socket.io, etc.)
  const [notifications, setNotifications] = React.useState([
    { id: 1, message: "New booking: John at 2:00 PM" },
    { id: 2, message: "Walk-in: Sarah checked in" },
    { id: 3, message: "Reminder: Haircut with Alex tomorrow" },
  ]);
  console.log(setNotifications);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-6 w-6" />
          {notifications.length > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
              {notifications.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="p-4 text-sm text-gray-500">No new notifications</div>
        ) : (
          notifications.map((note) => (
            <DropdownMenuItem key={note.id} className="text-sm">
              {note.message}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
