"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { DefaultValues, FieldValues, Path, SubmitHandler, useForm, UseFormReturn } from "react-hook-form";
import { ZodType } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Link from "next/link";

interface Props<T extends FieldValues> {
  schema: ZodType<T>;
  defaultValues: T;
  onSubmit: (data: T) => Promise<{ success: boolean; error?: string }>;
  type: "sign-in" | "sign-up";
}

// Correct field names
export const Field_Names = {
  username: "Username",
  email: "Email",
  password: "Password",
  role: "Role",
};

// Optional if you want to control input types
export const FIELD_TYPES = {
  username: "text",
  email: "email",
  password: "password",
  role: "text",
};

const AuthForm = <T extends FieldValues>({
  type,
  schema,
  defaultValues,
  onSubmit,
}: Props<T>) => {
  const isSignin = type === "sign-in";

  const form: UseFormReturn<T> = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as DefaultValues<T>,
  });

  const handleSubmit: SubmitHandler<T> = async (data) => {
    await onSubmit(data);
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-white">
        {isSignin ? "Welcome Back" : "Create Your Account"}
      </h1>
      <p className="text-gray-300">
        {isSignin ? "Access the vast collection of resources" : "Please complete all fields"}
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 w-full">
          {Object.keys(defaultValues).map((field) => (
            <FormField
              key={field}
              control={form.control}
              name={field as Path<T>}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="capitalize">
                    {Field_Names[field.name as keyof typeof Field_Names] || field.name}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type={FIELD_TYPES[field.name as keyof typeof FIELD_TYPES] || "text"}
                      placeholder=""
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <Button type="submit" className="w-full">
            {isSignin ? "Sign In" : "Sign Up"}
          </Button>
        </form>
      </Form>

      <p className="text-base text-center font-medium text-gray-300">
        {isSignin ? "New to BookTok?" : "Already have an account?"}{" "}
        <Link href={isSignin ? "/auth/sign-up" : "/auth/sign-in"} className="text-amber-200 underline">
          {isSignin ? "Sign Up" : "Sign In"}
        </Link>
      </p>
    </div>
  );
};

export default AuthForm;
