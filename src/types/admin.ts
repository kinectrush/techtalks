export type AdminUser = {
  id: string;
  username: string;
  displayName: string | null;
  email: string | null;
  isActive: boolean;
  role: 'admin' | 'editor';
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminCategory = {
  id: string;
  slug: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  showInMenu: boolean;
  createdAt: string;
};

export type AdminCategoryInput = {
  slug: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  showInMenu: boolean;
};

export type AdminArticleRow = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  excerpt: string;
  content: string | null;
  coverImage: string;
  editorPickCoverImageMobile: string | null;
  editorPickCoverImageDesktop: string | null;
  ogImage: string | null;
  canonicalUrl: string | null;
  affiliateUrl?: string | null;
  categoryId: string;
  authorId: string;
  categoryName?: string;
  authorName?: string;
  publishedAt: string;
  updatedAt: string | null;
  status: 'draft' | 'published' | 'archived';
  isActive: boolean;
  rating: number;
  tags: { slug: string; name: string }[];
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  isEditorPick: boolean;
  createdAt: string;
};

export type AdminArticleInput = {
  title: string;
  slug: string;
  subtitle?: string;
  excerpt: string;
  content?: string;
  coverImage: string;
  editorPickCoverImageMobile?: string;
  editorPickCoverImageDesktop?: string;
  ogImage?: string;
  canonicalUrl?: string;
  affiliateUrl?: string;
  categoryId: string;
  authorId: string;
  publishedAt: string;
  status: 'draft' | 'published' | 'archived';
  isActive: boolean;
  rating: number;
  pros?: string[];
  cons?: string[];
  tags?: { slug: string; name: string }[];
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  isEditorPick?: boolean;
};

export type AdminUserInput = {
  username: string;
  password?: string;
  displayName?: string;
  email?: string;
  isActive: boolean;
  role: 'admin' | 'editor';
};

export type AdminContactMessage = {
  id: string;
  title: string;
  email: string;
  content: string;
  createdAt: string;
};
