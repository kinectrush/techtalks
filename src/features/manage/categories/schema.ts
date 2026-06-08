import { z } from 'zod';

const hexColorRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

export const adminCategorySchema = z
  .object({
    name: z.string().min(2, 'Tên danh mục là bắt buộc'),
    slug: z
      .string()
      .min(2)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug không hợp lệ'),
    sortOrder: z.number().int().min(0),
    isActive: z.boolean(),
    showInMenu: z.boolean(),
    parentId: z.string().uuid().nullable().optional(),
    showOnHomepage: z.boolean().optional(),
    homepageTagline: z.string().max(200).nullable().optional(),
    homepageAccentColor: z
      .union([
        z.literal(''),
        z.string().regex(hexColorRegex, 'Màu accent phải là mã hex (#RGB hoặc #RRGGBB)'),
      ])
      .optional(),
  })
  .superRefine((data, ctx) => {
    const isSubCategory = Boolean(data.parentId);
    if (data.showOnHomepage && !isSubCategory) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Chỉ sub-category mới có thể hiển thị nổi bật trang chủ',
        path: ['showOnHomepage'],
      });
    }
    if (isSubCategory && data.showInMenu) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Sub-category không hiển thị trên menu',
        path: ['showInMenu'],
      });
    }
  });

export type AdminCategoryFormValues = z.infer<typeof adminCategorySchema>;
