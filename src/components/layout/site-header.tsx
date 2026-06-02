import { getTranslations } from 'next-intl/server';

import { LanguageSwitcher } from '@/components/common/language-switcher';
import { SiteLogo } from '@/components/common/site-logo';
import { getMenuCategories } from '@/features/category/queries';
import { Link } from '@/i18n/navigation';

export async function SiteHeader() {
  const t = await getTranslations('Site');
  const menuCategories = await getMenuCategories();

  return (
    <header className="sticky top-0 z-50 border-b bg-background">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4 lg:h-16 lg:px-6">
        <Link href="/" className="flex shrink-0 items-center">
          <SiteLogo alt={t('siteName')} priority />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link
            href="/"
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {t('navHome')}
          </Link>
          {menuCategories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/reviews?category=${cat.slug}`}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {cat.name}
            </Link>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end gap-1 sm:gap-2">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
