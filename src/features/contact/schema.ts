import { z } from 'zod';

export const contactMessageSchema = z.object({
  title: z.string().trim().min(3).max(120),
  email: z.string().trim().email().max(160),
  content: z.string().trim().min(10).max(4000),
});

export type ContactMessageValues = z.infer<typeof contactMessageSchema>;

