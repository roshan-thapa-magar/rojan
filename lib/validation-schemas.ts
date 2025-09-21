import { z } from "zod";

export const registerFormSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: "Full name must be at least 2 characters." })
      .max(50, { message: "Full name must be less than 50 characters." }),

    email: z.string().email({ message: "Please enter a valid email address." }),

    phone: z
      .string()
      .min(10, { message: "Phone number must be at least 10 digits." }),

    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long." })
      .regex(/^(?=.*[a-z])/, "Password must contain at least one lowercase letter")
      .regex(/^(?=.*[A-Z])/, "Password must contain at least one uppercase letter")
      .regex(/^(?=.*\d)/, "Password must contain at least one number")
      .regex(/^(?=.*[@$!%*?&])/, "Password must contain at least one special character (@$!%*?&)")
      .max(128, { message: "Password must be less than 128 characters." }),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"], // show error under confirmPassword field
  });

// Strong password validation schema for form validation
export const resetPasswordFormSchema = z.object({
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/^(?=.*[a-z])/, "Password must contain at least one lowercase letter")
    .regex(/^(?=.*[A-Z])/, "Password must contain at least one uppercase letter")
    .regex(/^(?=.*\d)/, "Password must contain at least one number")
    .regex(/^(?=.*[@$!%*?&])/, "Password must contain at least one special character (@$!%*?&)")
    .max(128, "Password must be less than 128 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// API validation schema (what the API expects)
export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/^(?=.*[a-z])/, "Password must contain at least one lowercase letter")
    .regex(/^(?=.*[A-Z])/, "Password must contain at least one uppercase letter")
    .regex(/^(?=.*\d)/, "Password must contain at least one number")
    .regex(/^(?=.*[@$!%*?&])/, "Password must contain at least one special character (@$!%*?&)")
    .max(128, "Password must be less than 128 characters"),
});

export type ResetPasswordFormInputs = z.infer<typeof resetPasswordFormSchema>;

// Barber form validation schema
export const barberFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters." })
    .max(50, { message: "Name must be less than 50 characters." }),
  
  email: z.string().email({ message: "Please enter a valid email address." }),
  
  phone: z
    .string()
    .min(10, { message: "Phone number must be at least 10 digits." }),
  
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long." })
    .max(128, { message: "Password must be less than 128 characters." }),
  
  image: z.string().optional(),
  
  position: z
    .string()
    .min(2, { message: "Position must be at least 2 characters." })
    .max(50, { message: "Position must be less than 50 characters." }),
  
  experience: z
    .union([z.string(), z.number()])
    .transform((val) => {
      const num = typeof val === "string" ? parseInt(val) : val;
      return isNaN(num) ? 0 : num;
    })
    .refine((val) => val >= 0, { message: "Experience must be 0 or more years." })
    .refine((val) => val <= 50, { message: "Experience must be less than 50 years." }),
  
  status: z.enum(["active", "inactive"], {
    message: "Please select a status.",
  }),
});

// Barber form validation schema for editing (password optional)
export const barberEditFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters." })
    .max(50, { message: "Name must be less than 50 characters." }),
  
  email: z.string().email({ message: "Please enter a valid email address." }),
  
  phone: z
    .string()
    .min(10, { message: "Phone number must be at least 10 digits." }),
  
  password: z
    .string()
    .refine((val) => val === "" || val.length >= 6, {
      message: "Password must be at least 6 characters long or leave empty to keep current password.",
    })
    .refine((val) => val === "" || val.length <= 128, {
      message: "Password must be less than 128 characters.",
    }),
  
  image: z.string().optional(),
  
  position: z
    .string()
    .min(2, { message: "Position must be at least 2 characters." })
    .max(50, { message: "Position must be less than 50 characters." }),
  
  experience: z
    .union([z.string(), z.number()])
    .transform((val) => {
      const num = typeof val === "string" ? parseInt(val) : val;
      return isNaN(num) ? 0 : num;
    })
    .refine((val) => val >= 0, { message: "Experience must be 0 or more years." })
    .refine((val) => val <= 50, { message: "Experience must be less than 50 years." }),
  
  status: z.enum(["active", "inactive"], {
    message: "Please select a status.",
  }),
});

export type BarberFormInputs = z.infer<typeof barberFormSchema>;
export type BarberEditFormInputs = z.infer<typeof barberEditFormSchema>;
