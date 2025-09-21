"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { TimePicker } from "@/components/ui/time-picker";
import { toast } from "sonner";
import { Store, Clock, Settings } from "lucide-react";

const time12HourRegex = /^(0?[1-9]|1[0-2]):([0-5]\d) ?(AM|PM)$/i;

const shopSchema = z
  .object({
    shopStatus: z.boolean(),
    openingTime: z
      .string()
      .optional()
      .refine(
        (val) => !val || time12HourRegex.test(val),
        "Invalid time format"
      ),
    closingTime: z
      .string()
      .optional()
      .refine(
        (val) => !val || time12HourRegex.test(val),
        "Invalid time format"
      ),
  })
  .refine(
    (data) => {
      if (data.shopStatus) return !!(data.openingTime && data.closingTime);
      return true;
    },
    { message: "Opening and closing times are required when shop is open" }
  );

type ShopForm = z.infer<typeof shopSchema>;

export default function ShopStatusForm() {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ShopForm>({
    resolver: zodResolver(shopSchema),
    defaultValues: {
      shopStatus: false,
      openingTime: "",
      closingTime: "",
    },
  });

  const shopStatus = watch("shopStatus");

  useEffect(() => {
    async function fetchShop() {
      try {
        const res = await fetch("/api/shop");
        const data = await res.json();
        // Convert string status to boolean
        const formattedData = {
          ...data,
          shopStatus: data.shopStatus === "open",
        };
        reset(formattedData);
      } catch (err) {
        console.error(err);
      }
    }
    fetchShop();
  }, [reset]);

  const onSubmit = async (data: ShopForm) => {
    try {
      const apiData = {
        ...data,
        shopStatus: data.shopStatus ? "open" : "closed",
      };

      const res = await fetch("/api/shop", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiData),
      });
      if (!res.ok) throw new Error("Failed to update shop status");
      toast.success("Shop status updated!");
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Store className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Shop Management
            </h1>
            <p className="text-muted-foreground">
              Configure your shop status and operating hours
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-card rounded-xl border shadow-sm p-6 space-y-6"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Settings className="h-5 w-5 text-muted-foreground" />
              <div>
                <label className="text-sm font-medium text-foreground">
                  Shop Status
                </label>
                <p className="text-xs text-muted-foreground">
                  {shopStatus
                    ? "Your shop is currently open"
                    : "Your shop is currently closed"}
                </p>
              </div>
            </div>
            <Controller
              control={control}
              name="shopStatus"
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>
          {errors.shopStatus && (
            <p className="text-destructive text-sm">
              {errors.shopStatus.message}
            </p>
          )}
        </div>

        <div
          className={`space-y-4 ${
            !shopStatus ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-medium text-foreground">
              Operating Hours
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Opening Time
              </label>
              <Controller
                control={control}
                name="openingTime"
                render={({ field }) => (
                  <TimePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select opening time"
                  />
                )}
              />
              {errors.openingTime && (
                <p className="text-destructive text-sm">
                  {errors.openingTime.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Closing Time
              </label>
              <Controller
                control={control}
                name="closingTime"
                render={({ field }) => (
                  <TimePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select closing time"
                  />
                )}
              />
              {errors.closingTime && (
                <p className="text-destructive text-sm">
                  {errors.closingTime.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button
            type="submit"
            className="w-full md:w-auto px-8"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
