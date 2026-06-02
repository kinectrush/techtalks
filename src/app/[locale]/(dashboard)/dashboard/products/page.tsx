import { redirect } from 'next/navigation';

import { routing, type Locale } from '@/i18n/routing';

type ProductsRedirectPageProps = {
  params: Promise<{ locale: string }>;
};

/** Legacy boilerplate route — redirects to review list. */
export default async function ProductsRedirectPage({
  params,
}: ProductsRedirectPageProps) {
  const { locale } = await params;
  redirect(`/${locale as Locale}/dashboard/reviews`);
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
