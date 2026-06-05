import { Home, Rocket, Sparkles, WifiOff } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';

export default async function NotFound() {
  const t = await getTranslations('NotFound');

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_oklch(0.55_0.22_25_/_0.12),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_oklch(0.7_0.15_250_/_0.1),_transparent_50%)]"
        />
        <div
          aria-hidden
          className="not-found-blob not-found-blob-1 absolute -left-16 top-24 h-56 w-56 rounded-full bg-brand/15 blur-3xl"
        />
        <div
          aria-hidden
          className="not-found-blob not-found-blob-2 absolute -right-10 bottom-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
        />
        <div
          aria-hidden
          className="not-found-blob not-found-blob-3 absolute left-1/2 top-1/3 h-40 w-40 -translate-x-1/2 rounded-full bg-amber-400/10 blur-2xl"
        />

        <div className="relative mx-auto w-full max-w-2xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/5 px-4 py-1.5 text-sm font-medium text-brand">
            <WifiOff className="h-4 w-4" aria-hidden />
            <span>{t('errorCode')}</span>
            <Sparkles className="h-4 w-4 animate-pulse" aria-hidden />
          </div>

          <p
            aria-hidden
            className="select-none bg-gradient-to-br from-brand via-primary to-amber-500 bg-clip-text text-[clamp(5rem,18vw,9rem)] font-black leading-none tracking-tighter text-transparent"
          >
            {t('errorCode')}
          </p>

          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
            {t('title')}
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base text-muted-foreground sm:text-lg">
            {t('subtitle')}
          </p>
          <p className="mt-2 text-sm text-muted-foreground/80">{t('hint')}</p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="min-w-[180px] gap-2">
              <Link href="/">
                <Home className="h-4 w-4" aria-hidden />
                {t('ctaHome')}
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="min-w-[180px] gap-2"
            >
              <Link href="/reviews">
                <Rocket className="h-4 w-4" aria-hidden />
                {t('ctaReviews')}
              </Link>
            </Button>
          </div>

          <div
            aria-hidden
            className="mx-auto mt-14 flex max-w-xs items-center justify-center gap-3 opacity-60"
          >
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              TechTalks
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
