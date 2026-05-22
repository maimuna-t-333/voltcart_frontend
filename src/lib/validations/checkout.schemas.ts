import { z } from 'zod';

export const contactSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters'),

  email: z
    .string()
    .email('Please enter a valid email address'),

  phone: z
    .string()
    .min(7, 'Please enter a valid phone number'),
});

export type ContactFormData = z.infer<typeof contactSchema>;

export const shippingSchema = z.object({
  address: z
    .string()
    .min(5, 'Please enter a valid street address'),

  city: z
    .string()
    .min(2, 'Please enter a valid city'),

  state: z
    .string()
    .min(2, 'Please enter a valid state'),

  zip: z
    .string()
    .min(4, 'Please enter a valid ZIP code'),

  country: z
    .string()
    .min(2, 'Please select a country'),
});

export type ShippingFormData = z.infer<typeof shippingSchema>;