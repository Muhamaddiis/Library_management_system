import { z } from 'zod';

export const signupSchema = z.object({
    username: z.string().min(3, { message: 'Name must be at least 3 characters long' }),
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
    role: z.string().default("user")
})

export const loginSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
  });