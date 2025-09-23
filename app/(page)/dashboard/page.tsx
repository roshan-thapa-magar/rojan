"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Users,
  Calendar,
  Scissors,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  BarChart3,
  Settings,
  Mail,
  Store,
} from "lucide-react";
import Link from "next/link";
import { useUserContext } from "@/context/UserContext";
import { AdminOrBarber } from "@/components/role-guard";
import EmailTest from "@/components/email-test";

interface DashboardStats {
  totalAppointments: number;
  todayAppointments: number;
  totalClients: number;
  totalBarbers: number;
  totalServices: number;
  monthlyRevenue: number;
  pendingAppointments: number;
  completedAppointments: number;
}

interface ShopStatus {
  shopStatus: string;
  openingTime: string | null;
  closingTime: string | null;
}

interface RecentAppointment {
  id: string;
  clientName: string;
  service: string;
  barber: string;
  time: string;
  status: "scheduled" | "pending" | "completed" | "cancelled";
  amount: number;
}

interface AppointmentData {
  _id: string;
  name: string;
  schedule?: string;
  status: string;
  service?: {
    type: string;
    price: number;
  };
  barber?: string;
}

interface UserData {
  role: string;
}

export default function DashboardPage() {
  return (
    <AdminOrBarber>
      <DashboardContent />
    </AdminOrBarber>
  );
}

function DashboardContent() {
  const { user } = useUserContext();
  const [stats, setStats] = useState<DashboardStats>({
    totalAppointments: 0,
    todayAppointments: 0,
    totalClients: 0,
    totalBarbers: 0,
    totalServices: 0,
    monthlyRevenue: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
  });
  const [shopStatus, setShopStatus] = useState<ShopStatus>({
    shopStatus: "closed",
    openingTime: null,
    closingTime: null,
  });
  const [recentAppointments, setRecentAppointments] = useState<
    RecentAppointment[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch appointments
      const appointmentsRes = await fetch("/api/appointments");
      const appointments = await appointmentsRes.json();

      // Fetch users
      const usersRes = await fetch("/api/users");
      const users = await usersRes.json();

      // Fetch services
      const servicesRes = await fetch("/api/services");
      const services = await servicesRes.json();

      // Fetch shop status
      const shopRes = await fetch("/api/shop");
      const shopData = await shopRes.json();
      setShopStatus(shopData);

      // Calculate stats
      const today = new Date().toISOString().split("T")[0];
      const todayAppts = appointments.filter((apt: AppointmentData) =>
        apt.schedule?.startsWith(today)
      );

      const pendingAppts = appointments.filter(
        (apt: AppointmentData) =>
          apt.status === "pending" || apt.status === "scheduled"
      );

      const completedAppts = appointments.filter(
        (apt: AppointmentData) => apt.status === "completed"
      );

      const barbers = users.filter((u: UserData) => u.role === "barber");
      const clients = users.filter((u: UserData) => u.role === "user");

      // Calculate monthly revenue (simplified)
      const monthlyRevenue = completedAppts.reduce(
        (sum: number, apt: AppointmentData) => sum + (apt.service?.price || 0),
        0
      );

      setStats({
        totalAppointments: appointments.length,
        todayAppointments: todayAppts.length,
        totalClients: clients.length,
        totalBarbers: barbers.length,
        totalServices: services.length,
        monthlyRevenue,
        pendingAppointments: pendingAppts.length,
        completedAppointments: completedAppts.length,
      });

      // Set recent appointments
      const recent = appointments.slice(0, 5).map((apt: AppointmentData) => ({
        id: apt._id,
        clientName: apt.name,
        service: apt.service?.type || "Unknown",
        barber: apt.barber || "Unassigned",
        time: apt.schedule,
        status: apt.status,
        amount: apt.service?.price || 0,
      }));

      setRecentAppointments(recent);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "scheduled":
        return <Clock className="h-4 w-4" />;
      case "pending":
        return <AlertCircle className="h-4 w-4" />;
      case "cancelled":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.name || "User"}! 👋
        </h1>
        <p className="text-gray-600">
          Here&apos;s what&apos;s happening with your barber shop today.
        </p>
      </div>

      {/* Shop Status Section */}
      <div className="mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex  items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Store className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-1">Shop Status</h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          shopStatus.shopStatus === "open"
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      ></div>
                      <span className="capitalize font-medium">
                        {shopStatus.shopStatus === "open" ? "Open" : "Closed"}
                      </span>
                    </div>
                    {shopStatus.shopStatus === "open" &&
                      shopStatus.openingTime &&
                      shopStatus.closingTime && (
                        <>
                          <span>•</span>
                          <span>
                            {shopStatus.openingTime} - {shopStatus.closingTime}
                          </span>
                        </>
                      )}
                  </div>
                </div>
              </div>

              <div className="hidden md:block text-right">
                <Badge
                  variant={
                    shopStatus.shopStatus === "open" ? "default" : "secondary"
                  }
                  className="text-sm px-3 py-1"
                >
                  {shopStatus.shopStatus === "open"
                    ? "Currently Open"
                    : "Currently Closed"}
                </Badge>
                {shopStatus.shopStatus === "open" && (
                  <p className="text-xs text-gray-500 mt-1">
                    Accepting appointments
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Stats Grid */}
      {user?.role === "admin" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Appointments
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalAppointments}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.todayAppointments} today
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Clients
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClients}</div>
              <p className="text-xs text-muted-foreground">Active customers</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Barbers
              </CardTitle>
              <Scissors className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBarbers}</div>
              <p className="text-xs text-muted-foreground">Available staff</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Monthly Revenue
              </CardTitle>
              रु
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                रु {stats.monthlyRevenue}
              </div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +12% from last month
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions & Recent Activity */}
      {user?.role === "admin" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Quick Actions */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                asChild
                className="w-full justify-start"
                variant="outline"
              >
                <Link href="/bookings">
                  <Calendar className="h-4 w-4 mr-2" />
                  New Booking
                </Link>
              </Button>

              <Button
                asChild
                className="w-full justify-start"
                variant="outline"
              >
                <Link href="/clients">
                  <Users className="h-4 w-4 mr-2" />
                  Add Client
                </Link>
              </Button>

              {user?.role === "admin" && (
                <>
                  <Button
                    asChild
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Link href="/add-services">
                      <Scissors className="h-4 w-4 mr-2" />
                      Add Service
                    </Link>
                  </Button>

                  <Button
                    asChild
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Link href="/inventory">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Manage Inventory
                    </Link>
                  </Button>
                </>
              )}

              <Button
                asChild
                className="w-full justify-start"
                variant="outline"
              >
                <Link href="/profile">
                  <Settings className="h-4 w-4 mr-2" />
                  Profile Settings
                </Link>
              </Button>

              <Button
                asChild
                className="w-full justify-start"
                variant="outline"
              >
                <Link href="/settings">
                  <Store className="h-4 w-4 mr-2" />
                  Manage Shop Status
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Recent Appointments */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Appointments
              </CardTitle>
              <CardDescription>Latest bookings and updates</CardDescription>
            </CardHeader>
            <CardContent>
              {recentAppointments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No recent appointments</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-3 border dark:bg-accent rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {appointment.clientName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">
                            {appointment.clientName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {appointment.service}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(appointment.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(appointment.status)}
                            {appointment.status}
                          </span>
                        </Badge>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            ${appointment.amount}
                          </p>
                          <p className="text-xs text-gray-500">
                            {appointment.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 pt-4 border-t">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/bookings">View All Appointments</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Additional Stats Row */}
      {user?.role === "admin" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                Pending Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                {stats.pendingAppointments}
              </div>
              <p className="text-sm text-gray-600">
                Appointments awaiting confirmation or action
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Completed This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {stats.completedAppointments}
              </div>
              <p className="text-sm text-gray-600">
                Successfully completed appointments
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Email Test Section (Admin Only) */}
      {user?.role === "admin" && (
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Barber Communication
              </CardTitle>
              <CardDescription>
                Manage and send emails to barbers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmailTest />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
