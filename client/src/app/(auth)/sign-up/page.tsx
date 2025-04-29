"use client";

import AuthForm from '@/app/Components/AuthForm';
import { signupSchema } from '@/lib/validations';
import { z } from 'zod';
import React from 'react';

// Define the types based on your Zod signup schema
type SignupFormData = z.infer<typeof signupSchema>;

const page = () => {

  const handleSignup = async (data: SignupFormData) => {
    try {
      const response = await fetch('http://localhost:8000/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { success: false, error: errorText || "Signup failed" };
      }

      const responseData = await response.text();
      console.log("Signup successful:", responseData);

      return { success: true };

    } catch (error: any) {
      console.error("Signup error:", error.message);
      return { success: false, error: error.message };
    }
  };

  return (
    <AuthForm
      type="sign-up"
      schema={signupSchema}
      defaultValues={{
        username: "",
        email: "",
        password: "",
        role: "user", // default role
      }}
      onSubmit={handleSignup}
    />
  );
}

export default page;
