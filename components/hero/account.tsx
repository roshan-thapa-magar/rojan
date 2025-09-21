"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useUserContext } from "@/context/UserContext";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// ---------------- Zod Schema ----------------
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\+?[0-9]{7,15}$/, "Invalid phone number"),
  password: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 6, {
      message: "Password must be at least 6 characters",
    }),
  ageGroup: z.enum(["adult", "student", "old", "child"] as const),
  customerType: z.enum(["regular", "VIP", "new"] as const).optional(),
  image: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, reloadUser } = useUserContext();
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      ageGroup: "adult",
      customerType: "new",
      image: "",
    },
  });
  useEffect(() => {
    reloadUser();
  }, [reloadUser]);
  // Populate form when user data is loaded
  useEffect(() => {
    if (!user) return;

    const ageGroup = ["adult", "student", "old", "child"].includes(
      user.ageGroup
    )
      ? (user.ageGroup as "adult" | "student" | "old" | "child")
      : "adult";

    const customerType = ["regular", "VIP", "new"].includes(user.customerType)
      ? (user.customerType as "regular" | "VIP" | "new")
      : "new";

    form.reset({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      password: "",
      ageGroup,
      customerType,
      image: user.image || "",
    });

    setFilePreview(user.image || null);
  }, [user, form]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result as string);
      form.setValue("image", reader.result as string, { shouldDirty: true });
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      if (!user?._id) throw new Error("User not loaded");

      const payload: Partial<ProfileFormValues> & { avatar?: string } = {
        ...values,
        avatar: values.image,
      };

      if (!payload.password) delete payload.password;

      const res = await fetch(`/api/users/${user._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update profile");
      }

      reloadUser();
      toast.success("Profile updated successfully!");
      form.reset(values); // Reset dirty state
    } catch (err: unknown) {
      toast.error((err as Error).message || "Profile update failed");
    }
  };

  // Check if any changes (form fields or avatar)
  const hasChanges = form.formState.isDirty || filePreview !== user?.image;

  return (
    <div className="min-h-full flex flex-col items-center p-6 lg:p-12 mt-16 bg-zinc-950">
      <div className="w-full max-w-3xl bg-neutral-900 text-white rounded-2xl shadow-md p-8 space-y-6">
        <h2 className="text-2xl font-bold text-neutral-500 text-center">
          Edit Profile
        </h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Avatar */}
            <div className="flex flex-col items-center space-y-4">
              <label className="cursor-pointer relative">
                <Avatar className="w-24 h-24">
                  {filePreview ? (
                    <AvatarImage src={filePreview} />
                  ) : (
                    <AvatarFallback>
                      {form.getValues("name")?.[0]}
                    </AvatarFallback>
                  )}
                </Avatar>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white font-semibold pointer-events-none">
                  Change
                </div>
              </label>
            </div>

            {/* Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter your name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        {...field}
                        placeholder="Enter your email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        {...field}
                        placeholder="+977 9800000000"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        {...field}
                        placeholder="Enter new password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ageGroup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age Group</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select age group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="adult">Adult</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="old">Old</SelectItem>
                        <SelectItem value="child">Child</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Type</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 cursor-pointer"
              disabled={!hasChanges}
            >
              Save Profile
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
