import { getTranslations } from 'next-intl/server';

import { ContactMessageDialog } from '@/components/common/contact-message-dialog';
import { SiteLogo } from '@/components/common/site-logo';
import { MobileNavDialog } from '@/components/layout/mobile-nav-dialog';
import { getMenuCategories } from '@/features/category/queries';
import { Link } from '@/i18n/navigation';

export async function SiteHeader() {
  const t = await getTranslations('Site');
  const menuCategories = await getMenuCategories();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 lg:h-16 lg:px-6">
        <Link href="/" className="flex shrink-0 cursor-pointer items-center">
          <SiteLogo alt={t('siteName')} priority />
        </Link>

        <nav className="hidden flex-1 items-center justify-center md:flex md:min-w-0">
          <div className="flex max-w-3xl items-center gap-1 overflow-x-auto whitespace-nowrap rounded-md px-1">
            <Link
              href="/"
              className="cursor-pointer rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {t('navHome')}
            </Link>
            {menuCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/reviews?category=${cat.slug}`}
                className="cursor-pointer rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </nav>

        <div className="ml-auto flex shrink-0 items-center justify-end gap-2">
          <div className="hidden h-6 w-px bg-border md:block" />
          <ContactMessageDialog className="hidden gap-2 md:inline-flex" />
          <div className="md:hidden">
            <MobileNavDialog />
          </div>
        </div>
      </div>
    </header>
  );
}
