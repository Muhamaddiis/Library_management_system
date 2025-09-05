"use client";

import AuthForm from '@/app/Components/AuthForm';
import { loginSchema } from '@/lib/validations';
import { z } from 'zod';
import React from 'react';
import { useRouter } from 'next/navigation';

// Define the types based on your Zod login schema
type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  const router = useRouter()
  const handleLogin = async (data: LoginFormData) => {
    try {
      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include', // needed to receive cookie
      });
  
      if (!response.ok) {
        const errorText = await response.text(); // plain text error
        return { success: false, error: errorText || "Login failed" };
      }
  
      const responseData = await response.json(); // JSON { token: "..." }
      console.log("Login successful! Token:", responseData.token);
      router.push('/')
      // (Optional) Save token manually if you want, though cookie is already set
      // localStorage.setItem("token", responseData.token);
      return { success: true };
  
    } catch (error: any) {
      console.error("Login error:", error.message);
      return { success: false, error: error.message };
    }
  };
  

  return (
    <AuthForm
      type="sign-in"
      schema={loginSchema}
      defaultValues={{
        username: "",
        password: "",
      }}
      onSubmit={handleLogin}
    />
  );
}

export default Login;
