"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, Variants } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useUserContext } from "@/context/UserContext";
import { toast } from "sonner";
import { io, Socket } from "socket.io-client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";

// Types
interface Barber {
  _id: string;
  name: string;
  role?: string; // Add role field for socket updates
}

interface Service {
  _id: string;
  type: string;
  price: number;
}

interface Appointment {
  _id: string;
  schedule: string; // ISO string
  status: "pending" | "scheduled" | "completed" | "cancelled";
  barber: string;
  service: { type: string; price: number };
  myId?: string; // Add myId field for user identification
}

interface Shop {
  shopStatus: string;
  openingTime: string | null;
  closingTime: string | null;
}

// Form validation schema
const bookingSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .nonempty("Phone number is required")
    .min(7, "Phone number too short"),
  schedule: z.date().refine((val) => !!val, {
    message: "Please select a date and time",
  }),
  service: z.string().min(1, "Please select a service"),
  barber: z.string().min(1, "Please choose a barber"),
  customerType: z.string(),
  ageGroup: z.enum(["student", "adult", "child", "young", "other"]),
  paymentMethod: z.enum(["cash", "online"]),
});

type BookingFormData = z.infer<typeof bookingSchema>;

// Convert AM/PM time string to 24-hour
function parseTimeTo24Hour(timeStr: string) {
  const [time, modifier] = timeStr.split(" ");
  const [hours, minutes] = time.split(":").map(Number);
  let h = hours;
  if (modifier === "PM" && hours < 12) h += 12;
  if (modifier === "AM" && hours === 12) h = 0;
  return { hours: h, minutes };
}

export default function BookingForm() {
  const { user, reloadUser } = useUserContext();
  const { status } = useSession();
  const router = useRouter();
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [userAppointments, setUserAppointments] = useState<Appointment[]>([]);
  const [shop, setShop] = useState<Shop>({
    shopStatus: "closed",
    openingTime: null,
    closingTime: null,
  });
  const [loading, setLoading] = useState(false);
  const [isFormDisabled, setIsFormDisabled] = useState(false);

  // Helpers for fetching
  async function loadAppointments() {
    try {
      const res = await fetch("/api/appointments?status=pending,scheduled");
      setAllAppointments(await res.json());
    } catch (err) {
      console.error(err);
      toast.error("Failed to load appointments");
    }
  }

  const loadUserAppointments = useCallback(async () => {
    if (!user?._id) return;
    try {
      const res = await fetch(`/api/appointments?myId=${user._id}`);
      setUserAppointments(await res.json());
    } catch (err) {
      console.error(err);
      toast.error("Failed to load your appointments");
    }
  }, [user?._id]);

  // React Hook Form with Zod
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      schedule: new Date(),
      service: "",
      barber: "",
      customerType: "regular",
      ageGroup: "other",
      paymentMethod: "cash",
    },
  });

  const watchSchedule = watch("schedule");

  // Prefill user info
  useEffect(() => {
    if (!user) return;
    setValue("name", user.name || "");
    setValue("email", user.email || "");
    setValue("phone", user.phone || "");
    setValue("customerType", user.customerType || "regular");
    setValue(
      "ageGroup",
      user.ageGroup as "student" | "adult" | "child" | "young" | "other"
    );
  }, [user, setValue]);

  // Fetch appointments
  useEffect(() => {
    loadAppointments();
  }, []);

  useEffect(() => {
    loadUserAppointments();
  }, [user?._id, loadUserAppointments]);

  // Handle form disabling based on shop status
  useEffect(() => {
    setIsFormDisabled(shop.shopStatus !== "open");
  }, [shop.shopStatus]);

  // Initialize socket connection for real-time updates
  useEffect(() => {
    const socket: Socket = io({
      path: "/socket.io/",
      transports: ["websocket", "polling"]
    });

    socket.on("connect", () => {
      console.log("Connected to socket server:", socket.id);
    });

    // Handle appointment updates
    socket.on("appointment:update", (newAppointment: Appointment) => {
      console.log("Received appointment update:", newAppointment);
      setAllAppointments((prev) => {
        // Check if this is an update to existing appointment or new appointment
        const existingIndex = prev.findIndex((a) => a._id === newAppointment._id);
        if (existingIndex !== -1) {
          // Update existing appointment
          const updated = [...prev];
          updated[existingIndex] = newAppointment;
          return updated;
        } else {
          // Add new appointment (avoid duplicates)
          if (prev.find((a) => a._id === newAppointment._id)) return prev;
          return [...prev, newAppointment];
        }
      });

      // Update user appointments if it belongs to current user
      if (newAppointment.myId === user?._id) {
        setUserAppointments((prev) => {
          const existingIndex = prev.findIndex((a) => a._id === newAppointment._id);
          if (existingIndex !== -1) {
            const updated = [...prev];
            updated[existingIndex] = newAppointment;
            return updated;
          } else {
            if (prev.find((a) => a._id === newAppointment._id)) return prev;
            return [...prev, newAppointment];
          }
        });
      }
    });

    socket.on("appointment:deleted", (data: { id: string; appointment: Appointment }) => {
      console.log("Received appointment deletion:", data);
      setAllAppointments((prev) => prev.filter((a) => a._id !== data.id));
      
      // Remove from user appointments if it belongs to current user
      if (data.appointment.myId === user?._id) {
        setUserAppointments((prev) => prev.filter((a) => a._id !== data.id));
      }
    });

    // Handle service updates
    socket.on("service:update", (updatedService: Service) => {
      console.log("Received service update:", updatedService);
      setServices((prev) => {
        const existingIndex = prev.findIndex((s) => s._id === updatedService._id);
        if (existingIndex !== -1) {
          const updated = [...prev];
          updated[existingIndex] = updatedService;
          return updated;
        } else {
          if (prev.find((s) => s._id === updatedService._id)) return prev;
          return [...prev, updatedService];
        }
      });
    });

    socket.on("service:deleted", (data: { id: string; service: Service }) => {
      console.log("Received service deletion:", data);
      setServices((prev) => prev.filter((s) => s._id !== data.id));
    });

    // Handle barber updates
    socket.on("user:update", (updatedUser: Barber) => {
      console.log("Received user update:", updatedUser);
      // Only update if it's a barber
      if (updatedUser.role === "barber") {
        setBarbers((prev) => {
          const existingIndex = prev.findIndex((b) => b._id === updatedUser._id);
          if (existingIndex !== -1) {
            const updated = [...prev];
            updated[existingIndex] = updatedUser;
            return updated;
          } else {
            if (prev.find((b) => b._id === updatedUser._id)) return prev;
            return [...prev, updatedUser];
          }
        });
      }
    });

    socket.on("user:deleted", (data: { id: string; user: Barber }) => {
      console.log("Received user deletion:", data);
      setBarbers((prev) => prev.filter((b) => b._id !== data.id));
    });

    // Handle shop status updates
    socket.on("shop:update", (shopData: Shop) => {
      console.log("Received shop update:", shopData);
      setShop(shopData);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from socket server");
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    // Cleanup function
    return () => {
      socket.disconnect();
    };
  }, [user?._id]);

  // Fetch barbers, services, shop
  useEffect(() => {
    async function fetchData() {
      try {
        const barberRes = await fetch("/api/users?role=barber&status=active");
        setBarbers(await barberRes.json());

        const serviceRes = await fetch("/api/services?status=active");
        setServices(await serviceRes.json());

        const shopRes = await fetch("/api/shop");
        setShop(await shopRes.json());
      } catch (err) {
        console.error(err);
        toast.error("Failed to load barbers, services, or shop info");
      }
    }
    fetchData();
  }, []);

  // Filter times
  const filterTime = (time: Date) => {
    if (!shop.openingTime || !shop.closingTime) return true;
    const { hours: openH, minutes: openM } = parseTimeTo24Hour(
      shop.openingTime
    );
    const { hours: closeH, minutes: closeM } = parseTimeTo24Hour(
      shop.closingTime
    );

    const selectedDate = moment(time);
    const now = moment();

    const openDate = selectedDate.clone().set({
      hour: openH,
      minute: openM,
      second: 0,
      millisecond: 0,
    });
    const closeDate = selectedDate.clone().set({
      hour: closeH,
      minute: closeM,
      second: 0,
      millisecond: 0,
    });

    if (selectedDate.isBefore(openDate) || selectedDate.isAfter(closeDate)) {
      return false;
    }

    if (selectedDate.isSame(now, "day") && selectedDate.isBefore(now)) {
      return false;
    }

    const selectedBarberId = watch("barber");
    const selectedBarberName = barbers.find(
      (b) => b._id === selectedBarberId
    )?.name;

    if (selectedBarberName) {
      for (const appt of allAppointments) {
        if (
          appt.barber === selectedBarberName &&
          (appt.status === "pending" || appt.status === "scheduled")
        ) {
          const apptTime = moment(appt.schedule);
          if (selectedDate.isSame(apptTime)) {
            return false;
          }
        }
      }
    }
    return true;
  };

  // Submit
  const onSubmit = async (data: BookingFormData) => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/appointment");
      return;
    }
    if (shop.shopStatus !== "open") {
      toast.error("The shop is currently closed. Cannot make appointments.");
      return;
    }
    const hasActiveAppointment = userAppointments.some(
      (appt) => appt.status === "pending" || appt.status === "scheduled"
    );
    if (hasActiveAppointment) {
      toast.error("You already have a pending or scheduled appointment.");
      return;
    }

    const selectedDate = new Date(data.schedule);
    if (selectedDate < new Date()) {
      toast.error("Please select a valid date and time.");
      return;
    }
    if (!filterTime(selectedDate)) {
      toast.error(
        `Please select a valid time within shop hours: ${shop.openingTime} - ${shop.closingTime}`
      );
      return;
    }

    setLoading(true);
    try {
      const selectedService = services.find((s) => s._id === data.service);
      const selectedBarberObj = barbers.find((b) => b._id === data.barber);
      if (!selectedService || !selectedBarberObj) {
        throw new Error("Service or barber not found");
      }
      const payload = {
        myId: user?._id,
        ...data,
        service: { type: selectedService.type, price: selectedService.price },
        barber: selectedBarberObj.name,
      };
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      toast.success("Appointment booked successfully!");
      reloadUser();

      // Real-time updates will handle UI updates via socket
    } catch (err) {
      console.error(err);
      toast.error("Booking failed");
    } finally {
      setLoading(false);
    }
  };

  const containerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.2 } },
  };
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section className="h-screen flex flex-col lg:flex-row">
      {/* Left image */}
      <div className="lg:w-1/2 relative h-64 lg:h-auto">
        <Image
          src="/image/book-bg.jpg"
          alt="Professional barber at work"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Right form */}
      <motion.div
        className="lg:w-1/2 relative bg-gray-900 text-white flex items-center justify-center p-8"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="absolute inset-0 bg-[#222227]/90"></div>
        <motion.div
          className="relative z-10 w-full max-w-md"
          variants={containerVariants}
        >
          <motion.div className="text-center mb-8" variants={itemVariants}>
            <h2 className="text-3xl font-bold mb-4">Make an appointment</h2>
            <p className="text-gray-300">
              Choose your preferred service, barber, and schedule.
            </p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="text-sm text-gray-400">Shop Status:</span>
              <span className={`text-sm font-medium ${
                shop.shopStatus === "open" ? "text-green-400" : "text-red-400"
              }`}>
                {shop.shopStatus === "open" ? "OPEN" : "CLOSED"}
              </span>
              {shop.openingTime && shop.closingTime && (
                <span className="text-sm text-gray-400">
                  ({shop.openingTime} - {shop.closingTime})
                </span>
              )}
            </div>
          </motion.div>

          {/* Shop Closed Overlay */}
          {isFormDisabled && (
            <motion.div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm z-20 flex items-center justify-center rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center p-6 bg-gray-800/90 rounded-lg border border-gray-600">
                <div className="text-red-400 text-2xl mb-2">🔒</div>
                <h3 className="text-xl font-bold text-white mb-2">Shop is Closed</h3>
                <p className="text-gray-300 mb-2">
                  We&apos;re currently not accepting appointments.
                </p>
                {shop.openingTime && shop.closingTime && (
                  <p className="text-sm text-gray-400">
                    Opening Hours: {shop.openingTime} - {shop.closingTime}
                  </p>
                )}
              </div>
            </motion.div>
          )}

          <motion.form
            onSubmit={handleSubmit(onSubmit)}
            className={`space-y-6 ${isFormDisabled ? 'pointer-events-none opacity-50' : ''}`}
            variants={containerVariants}
          >
            {/* Name & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div variants={itemVariants}>
                <Input
                  type="text"
                  readOnly
                  placeholder="Name"
                  {...register("name")}
                  className="bg-white/10 hidden border-white/20 text-white placeholder:text-gray-400"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.name.message}
                  </p>
                )}
              </motion.div>
              <motion.div variants={itemVariants}>
                <Input
                  type="email"
                  readOnly
                  placeholder="Email"
                  {...register("email")}
                  className="bg-white/10 hidden border-white/20 text-white placeholder:text-gray-400"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </motion.div>
            </div>

            {/* Phone & Schedule */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div variants={itemVariants}>
                <Input
                  type="tel"
                  placeholder={isFormDisabled ? "Shop is closed" : "Phone"}
                  {...register("phone")}
                  disabled={isFormDisabled}
                  className={`bg-white/10 border-white/20 text-white placeholder:text-gray-400 ${
                    isFormDisabled ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </motion.div>

              <motion.div variants={itemVariants}>
                <DatePicker
                  selected={watchSchedule}
                  onChange={(date) => setValue("schedule", date as Date)}
                  showTimeSelect
                  timeFormat="hh:mm aa"
                  timeIntervals={30}
                  filterTime={filterTime}
                  minDate={new Date()}
                  dateFormat="MMMM d, yyyy h:mm aa"
                  disabled={isFormDisabled || !watch("barber")} 
                  className={`bg-white/10 border-white/20 text-white placeholder:text-gray-400 w-full p-2 rounded ${
                    isFormDisabled ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  placeholderText={
                    isFormDisabled 
                      ? "Shop is closed" 
                      : `Select date & time (${shop.openingTime} - ${shop.closingTime})`
                  }
                />
                {errors.schedule && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.schedule.message}
                  </p>
                )}
              </motion.div>
            </div>

            {/* Service & Barber */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div variants={itemVariants}>
                <Select
                  value={watch("service")}
                  onValueChange={(val) => setValue("service", val)}
                  disabled={isFormDisabled}
                >
                  <SelectTrigger className={`bg-white/10 border-white/20 text-white w-full ${
                    isFormDisabled ? 'opacity-50 cursor-not-allowed' : ''
                  }`}>
                    <SelectValue placeholder={isFormDisabled ? "Shop is closed" : "Select Service"} />
                  </SelectTrigger>
                  <SelectContent>
                    {services.length > 0 ? (
                      services.map((s) => (
                        <SelectItem key={s._id} value={s._id}>
                          {s.type} - ${s.price}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-service" disabled>
                        No active services
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Select
                  value={watch("barber")}
                  onValueChange={(val) => setValue("barber", val)}
                  disabled={isFormDisabled}
                >
                  <SelectTrigger className={`bg-white/10 border-white/20 text-white w-full ${
                    isFormDisabled ? 'opacity-50 cursor-not-allowed' : ''
                  }`}>
                    <SelectValue placeholder={isFormDisabled ? "Shop is closed" : "Choose Barber"} />
                  </SelectTrigger>
                  <SelectContent>
                    {barbers.length > 0 ? (
                      barbers.map((b) => (
                        <SelectItem key={b._id} value={b._id}>
                          {b.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-barber" disabled>
                        No active barbers
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </motion.div>
            </div>

            {/* Age Group & Payment Method */}
            <div className="grid grid-cols-1 gap-4">
              <motion.div variants={itemVariants}>
                <Select
                  value={watch("ageGroup")}
                  onValueChange={(val) =>
                    setValue("ageGroup", val as BookingFormData["ageGroup"])
                  }
                  disabled={isFormDisabled}
                >
                  <SelectTrigger className={`bg-white/10 border-white/20 text-white w-full ${
                    isFormDisabled ? 'opacity-50 cursor-not-allowed' : ''
                  }`}>
                    <SelectValue placeholder={isFormDisabled ? "Shop is closed" : "Age Group"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="adult">Adult</SelectItem>
                    <SelectItem value="child">Child</SelectItem>
                    <SelectItem value="young">Young</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Select
                  value={watch("paymentMethod")}
                  onValueChange={(val) =>
                    setValue(
                      "paymentMethod",
                      val as BookingFormData["paymentMethod"]
                    )
                  }
                >
                  <SelectTrigger className="bg-white/10 hidden border-white/20 text-white w-full">
                    <SelectValue placeholder="Payment Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                  </SelectContent>
                </Select>
              </motion.div>
            </div>

            {/* Customer Type */}
            <motion.div variants={itemVariants}>
              <Input
                type="text"
                value={user?.customerType || "regular"}
                disabled
                className="bg-white/10 hidden border-white/20 text-gray-300"
              />
            </motion.div>

            {/* Submit */}
            <motion.div className="text-center" variants={itemVariants}>
              <Button
                type="submit"
                disabled={
                  status === "unauthenticated" ||
                  loading ||
                  isFormDisabled ||
                  userAppointments.some(
                    (appt) =>
                      appt.status === "pending" || appt.status === "scheduled"
                  )
                }
                className="bg-neutral-600 hover:bg-neutral-700 text-white font-semibold px-8 py-3 uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? "Booking..."
                  : isFormDisabled
                  ? "Shop Closed"
                  : userAppointments.some(
                      (appt) =>
                        appt.status === "pending" || appt.status === "scheduled"
                    )
                  ? "Already Booked"
                  : status === "unauthenticated"
                  ? "Login to Book"
                  : "Make Appointment"}
              </Button>
            </motion.div>
          </motion.form>
        </motion.div>
      </motion.div>
    </section>
  );
}
