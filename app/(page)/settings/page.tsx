"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TimePicker } from "@/components/ui/time-picker";
import { Badge } from "@/components/ui/badge";

import { Settings, Store, User, Bell, Clock, CheckCircle } from "lucide-react";
import { useUserContext } from "@/context/UserContext";
import { AdminOrBarber } from "@/components/role-guard";
import { toast } from "sonner";

interface ShopStatus {
  shopStatus: string;
  openingTime: string | null;
  closingTime: string | null;
}

interface UserProfile {
  name: string;
  email: string;
  phone: string;
}

export default function SettingsPage() {
  return (
    <AdminOrBarber>
      <SettingsContent />
    </AdminOrBarber>
  );
}

function SettingsContent() {
  const { user, reloadUser } = useUserContext();
  const [shopStatus, setShopStatus] = useState<ShopStatus>({
    shopStatus: "closed",
    openingTime: null,
    closingTime: null,
  });
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [shopLoading, setShopLoading] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      // Fetch shop status
      const shopRes = await fetch("/api/shop");
      const shopData = await shopRes.json();
      setShopStatus(shopData);

      // Fetch user profile
      if (user) {
        setUserProfile({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load settings");
    }
  }, [user]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateShopStatus = async (data: ShopStatus) => {
    try {
      setShopLoading(true);
      const apiData = {
        ...data,
        shopStatus: data.shopStatus === "open" ? "open" : "closed",
      };

      const res = await fetch("/api/shop", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiData),
      });

      if (!res.ok) throw new Error("Failed to update shop status");

      setShopStatus(data);
      toast.success("Shop status updated successfully!");
    } catch (error) {
      console.error("Error updating shop status:", error);
      toast.error("Failed to update shop status");
    } finally {
      setShopLoading(false);
    }
  };

  const updateUserProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/users/${user?._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userProfile),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      toast.success("Profile updated successfully!");
      reloadUser();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleShopStatusChange = (newStatus: string) => {
    const updatedStatus = {
      ...shopStatus,
      shopStatus: newStatus,
    };
    setShopStatus(updatedStatus);
    updateShopStatus(updatedStatus);
  };

  const handleTimeChange = (
    field: "openingTime" | "closingTime",
    value: string
  ) => {
    const updatedStatus = {
      ...shopStatus,
      [field]: value,
    };
    setShopStatus(updatedStatus);
    updateShopStatus(updatedStatus);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold  mb-2 flex items-center gap-3">
          <Settings className="h-8 w-8" />
          Settings
        </h1>
        <p className="text-gray-600">
          Manage your account settings and shop configuration
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Shop Status Settings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Store className="h-6 w-6 text-blue-600" />
              Shop Status & Operating Hours
            </CardTitle>
            <CardDescription>
              Configure your shop status and business hours
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Status Display */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div
                  className={`w-4 h-4 rounded-full ${
                    shopStatus.shopStatus === "open"
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                ></div>
                <div>
                  <p className="font-medium">Current Status</p>
                  <p className="text-sm text-gray-600">
                    {shopStatus.shopStatus === "open"
                      ? "Shop is currently open"
                      : "Shop is currently closed"}
                  </p>
                </div>
              </div>
              <Badge
                variant={
                  shopStatus.shopStatus === "open" ? "default" : "secondary"
                }
                className="text-sm"
              >
                {shopStatus.shopStatus === "open" ? "Open" : "Closed"}
              </Badge>
            </div>

            {/* Shop Status Toggle */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Switch
                  checked={shopStatus.shopStatus === "open"}
                  onCheckedChange={(checked) =>
                    handleShopStatusChange(checked ? "open" : "closed")
                  }
                  disabled={shopLoading}
                />
                <div>
                  <Label className="text-base font-medium">Shop Status</Label>
                  <p className="text-sm text-gray-600">
                    Toggle to open or close your shop
                  </p>
                </div>
              </div>
            </div>

            {/* Operating Hours */}
            {shopStatus.shopStatus === "open" && (
              <div className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <h3 className="font-medium text-blue-900">Operating Hours</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="openingTime">Opening Time</Label>
                    <TimePicker
                      value={shopStatus.openingTime || ""}
                      onChange={(value) =>
                        handleTimeChange("openingTime", value)
                      }
                      placeholder="Select opening time"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="closingTime">Closing Time</Label>
                    <TimePicker
                      value={shopStatus.closingTime || ""}
                      onChange={(value) =>
                        handleTimeChange("closingTime", value)
                      }
                      placeholder="Select closing time"
                    />
                  </div>
                </div>

                {shopStatus.openingTime && shopStatus.closingTime && (
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <CheckCircle className="h-4 w-4" />
                    <span>
                      Hours set: {shopStatus.openingTime} -{" "}
                      {shopStatus.closingTime}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Status Summary */}
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Status Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Status:</span>
                  <Badge
                    variant={
                      shopStatus.shopStatus === "open" ? "default" : "secondary"
                    }
                  >
                    {shopStatus.shopStatus === "open" ? "Open" : "Closed"}
                  </Badge>
                </div>
                {shopStatus.shopStatus === "open" &&
                  shopStatus.openingTime &&
                  shopStatus.closingTime && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Hours:</span>
                      <span>
                        {shopStatus.openingTime} - {shopStatus.closingTime}
                      </span>
                    </div>
                  )}
                <div className="flex items-center gap-2">
                  <span className="font-medium">Appointments:</span>
                  <span>
                    {shopStatus.shopStatus === "open"
                      ? "Accepting"
                      : "Not accepting"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <User className="h-6 w-6 text-green-600" />
              Profile Settings
            </CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={userProfile.name}
                onChange={(e) =>
                  setUserProfile({ ...userProfile, name: e.target.value })
                }
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={userProfile.email}
                onChange={(e) =>
                  setUserProfile({ ...userProfile, email: e.target.value })
                }
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={userProfile.phone}
                onChange={(e) =>
                  setUserProfile({ ...userProfile, phone: e.target.value })
                }
                placeholder="Enter your phone number"
              />
            </div>

            <Button
              onClick={updateUserProfile}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Updating..." : "Update Profile"}
            </Button>
          </CardContent>
        </Card>

        {/* Additional Settings */}
        {/* <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Bell className="h-6 w-6 text-purple-600" />
              Notifications
            </CardTitle>
            <CardDescription>
              Manage your notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">
                  Email Notifications
                </Label>
                <p className="text-sm text-gray-600">
                  Receive updates via email
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">
                  SMS Notifications
                </Label>
                <p className="text-sm text-gray-600">Receive updates via SMS</p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">
                  Appointment Reminders
                </Label>
                <p className="text-sm text-gray-600">
                  Get reminded about appointments
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
}
