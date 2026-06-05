import { getTranslations } from 'next-intl/server';

import { ContactMessageDialog } from '@/components/common/contact-message-dialog';
import { SiteLogo } from '@/components/common/site-logo';
import { FacebookIcon } from '@/components/icons/facebook-icon';
import { Link } from '@/i18n/navigation';

export async function SiteFooter() {
  const t = await getTranslations('Site');

  return (
    <footer className="mt-16 border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
        <div className="grid gap-8 md:grid-cols-3 md:items-start md:gap-10">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <SiteLogo
                alt={t('siteName')}
                className="h-9 w-auto object-contain"
              />
            </div>
            <p className="max-w-md text-sm text-muted-foreground">
              {t('tagline')}
            </p>
          </div>

          <div className="space-y-3 md:justify-self-center md:text-center">
            <p className="text-sm font-semibold text-foreground">
              {t('navHome')}
            </p>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground md:items-center">
              <Link href="/" className="cursor-pointer hover:text-foreground">
                {t('navHome')}
              </Link>
              <Link href="/reviews" className="cursor-pointer hover:text-foreground">
                {t('navReviews')}
              </Link>
            </div>
          </div>

          <div className="space-y-3 md:justify-self-end md:text-left">
            <p className="text-sm font-semibold text-foreground">Liên hệ</p>
            <div className="flex items-center gap-2 md:justify-end">
              <a
                href="https://www.facebook.com/techtalks.io.vn/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <FacebookIcon className="h-4 w-4" />
                Facebook
              </a>
              <ContactMessageDialog className="text-muted-foreground hover:text-foreground" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
