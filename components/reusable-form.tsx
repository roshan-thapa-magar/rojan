"use client";

import * as React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import { Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

export type FormFieldType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "textarea"
  | "select"
  | "image";

export interface FormFieldConfig {
  name: string;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  description?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  validation?: z.ZodTypeAny;
}

export interface ReusableFormProps<T extends Record<string, unknown>> {
  title?: string;
  description?: string;
  fields: FormFieldConfig[];
  onSubmit: (data: T) => void;
  submitText?: string;
  isLoading?: boolean;
  defaultValues?: T;
}

export function ReusableForm<T extends Record<string, unknown>>({
  title,
  description,
  fields,
  onSubmit,
  submitText = "Submit",
  isLoading = false,
  defaultValues = {} as T,
}: ReusableFormProps<T>) {
  // Build Zod schema dynamically
  const schema = z.object(
    fields.reduce<Record<string, z.ZodTypeAny>>((acc, field) => {
      let validator: z.ZodTypeAny = z.string();

      if (field.validation) validator = field.validation;
      else {
        switch (field.type) {
          case "email":
            validator = z.string().email("Invalid email");
            break;
          case "number":
            validator = z.coerce.number();
            break;
          case "image":
            validator = z.instanceof(File).optional();
            break;
          default:
            validator = z.string();
        }
      }

      if (!field.required) validator = validator.optional();
      acc[field.name] = validator;
      return acc;
    }, {})
  );

  type FormValues = z.infer<typeof schema>;
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const [imagePreview, setImagePreview] = React.useState<
    Record<string, string>
  >({});

  const handleImageChange = (
    fieldName: keyof FormValues,
    file: File | null
  ) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview((prev) => ({
          ...prev,
          [fieldName as string]: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
      form.setValue(fieldName, file as unknown as FormValues[keyof FormValues]);
    } else {
      setImagePreview((prev) => {
        const copy = { ...prev };
        delete copy[fieldName as string];
        return copy;
      });
      form.setValue(
        fieldName,
        undefined as unknown as FormValues[keyof FormValues]
      );
    }
  };

  const renderField = (field: FormFieldConfig) => {
    const name = field.name as keyof FormValues;

    switch (field.type) {
      case "textarea":
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={field.placeholder}
                    {...formField}
                    value={(formField.value as string) || ""}
                  />
                </FormControl>
                {field.description && (
                  <FormDescription>{field.description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "select":
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  <Select
                    value={(formField.value as string) || ""}
                    onValueChange={formField.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={field.placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                {field.description && (
                  <FormDescription>{field.description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "image":
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={name}
            render={() => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  <div className="space-y-4">
                    <label
                      htmlFor={`${field.name}-upload`}
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-4 text-gray-500" />
                        <p className="text-sm text-gray-500">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG or GIF (MAX. 800x400px)
                        </p>
                      </div>
                      <input
                        id={`${field.name}-upload`}
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) =>
                          handleImageChange(name, e.target.files?.[0] ?? null)
                        }
                      />
                    </label>
                    {imagePreview[field.name] && (
                      <Card>
                        <CardContent className="p-4 relative">
                          <div className="relative w-full h-32">
                            <Image
                              src={imagePreview[field.name]!}
                              alt="Preview"
                              fill
                              style={{ objectFit: "cover" }}
                              className="rounded-md"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => handleImageChange(name, null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </FormControl>
                {field.description && (
                  <FormDescription>{field.description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      default:
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  <Input
                    type={field.type}
                    placeholder={field.placeholder}
                    {...formField}
                    value={
                      field.type === "number"
                        ? (formField.value as number | undefined)
                        : (formField.value as string | undefined)
                    }
                  />
                </FormControl>
                {field.description && (
                  <FormDescription>{field.description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );
    }
  };

  const handleSubmit: SubmitHandler<FormValues> = (data) => onSubmit(data as T);

  return (
    <div className="space-y-6">
      {title && (
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {fields.map(renderField)}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Loading..." : submitText}
          </Button>
        </form>
      </Form>
    </div>
  );
}
