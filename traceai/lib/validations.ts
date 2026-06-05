"use client";

import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string()
    .regex(/^[+\d\s\-()]{7,20}$/, "Please enter a valid phone number")
    .optional()
    .or(z.literal("")),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  role: z.enum(["family", "citizen", "authority", "admin"]),
});

export const caseSchema = z.object({
  name: z.string().min(2, "Name is required"),
  age: z.coerce.number().min(0, "Age must be positive").max(120, "Age seems too high"),
  gender: z.enum(["male", "female", "other"]),
  lastSeenLocation: z.string().min(3, "Location is required"),
  lastSeenDate: z.string().min(1, "Date is required"),
  description: z.string().min(10, "Please provide more detail about the person"),
  clothing: z.string().optional(),
  distinguishingFeatures: z.string().optional(),
});

export const sightingSchema = z.object({
  caseId: z.string().min(1, "Select a missing person"),
  locationName: z.string().min(3, "Location is required"),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  description: z.string().min(10, "Please describe what you saw"),
  witnessName: z.string().optional(),
  witnessContact: z.string().optional(),
  isAnonymous: z.boolean(),
  reportedAt: z.string().min(1, "Date and time is required"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type CaseFormData = z.infer<typeof caseSchema>;
export type SightingFormData = z.infer<typeof sightingSchema>;
