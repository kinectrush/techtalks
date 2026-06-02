import { z } from 'zod';

export const adminUserSchema = z
  .object({
    username: z
      .string()
      .min(3, 'Username tối thiểu 3 ký tự')
      .regex(/^[a-z0-9_]+$/, 'Chỉ chữ thường, số và _'),
    password: z.string().optional(),
    displayName: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    isActive: z.boolean(),
    role: z.enum(['admin', 'editor']),
  })
  .refine(
    (data) => {
      if (!data.password) return true;
      return data.password.length >= 8;
    },
    { message: 'Mật khẩu tối thiểu 8 ký tự', path: ['password'] },
  );

export type AdminUserFormValues = z.infer<typeof adminUserSchema>;
