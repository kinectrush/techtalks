import { z } from 'zod';

export const adminCategorySchema = z.object({
  name: z.string().min(2, 'Tên danh mục là bắt buộc'),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug không hợp lệ'),
  sortOrder: z.number().int().min(0),
  isActive: z.boolean(),
  showInMenu: z.boolean(),
});

export type AdminCategoryFormValues = z.infer<typeof adminCategorySchema>;
