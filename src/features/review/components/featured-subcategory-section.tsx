import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { ArrowRight, Sparkles, Trophy } from 'lucide-react';
import { LinkPendingIndicator } from '@/components/common/link-pending-indicator';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { sortStandings } from '@/lib/world-cup/homepage-config';
import type { FeaturedSubcategory } from '@/types/review';
import { WorldCupGroupStandings } from './world-cup-group-standings';

type FeaturedSubcategorySectionProps = {
  featured: FeaturedSubcategory;
};

const DEFAULT_ACCENT = '#00A651';

function FeaturedArticleRow({
  article,
  accentColor,
  readLabel,
}: {
  article: FeaturedSubcategory['articles'][number];
  accentColor: string;
  readLabel: string;
}) {
  const href = `/review/${article.slug}` as const;

  return (
    <article className="group flex gap-4 border-b border-white/10 py-4 last:border-0">
      <Link
        href={href}
        className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg bg-black/30 sm:h-24 sm:w-36"
      >
        <Image
          src={article.coverImage}
          alt={article.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="144px"
        />
        <LinkPendingIndicator className="absolute inset-0 bg-black/35 text-white" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
        <Link href={href} className="inline-flex items-start gap-2">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-white transition-colors group-hover:text-[var(--featured-accent)] sm:text-base">
            {article.title}
          </h3>
          <LinkPendingIndicator className="mt-1 shrink-0 text-[var(--featured-accent)]" />
        </Link>
        <p className="line-clamp-2 text-xs text-white/55 sm:text-sm">
          {article.excerpt}
        </p>
        <span
          className="inline-flex items-center gap-1 text-xs font-medium"
          style={{ color: accentColor }}
        >
          {readLabel}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </article>
  );
}

export async function FeaturedSubcategorySection({
  featured,
}: FeaturedSubcategorySectionProps) {
  const t = await getTranslations('Review');
  const accent = featured.accentColor ?? DEFAULT_ACCENT;
  const viewAllHref = `/reviews?category=${featured.slug}` as const;
  const groups = sortStandings(featured.homepageConfig.groupStandings);

  return (
    <section
      aria-labelledby={`featured-${featured.slug}`}
      className="relative overflow-hidden rounded-2xl border border-emerald-500/20 shadow-xl"
      style={{ '--featured-accent': accent } as React.CSSProperties}
    >
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,166,81,0.35),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(255,193,7,0.12),transparent_50%),linear-gradient(135deg,#0a1f14_0%,#051510_40%,#0d0d0d_100%)]"
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 39px,
              rgba(255,255,255,0.5) 39px,
              rgba(255,255,255,0.5) 40px
            ),
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 39px,
              rgba(255,255,255,0.5) 39px,
              rgba(255,255,255,0.5) 40px
            )
          `,
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-20 blur-3xl"
        style={{ backgroundColor: accent }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-amber-400/10 blur-3xl"
        aria-hidden
      />

      <div className="relative space-y-5 p-6 md:p-8 lg:p-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-wider text-white/80 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-brand" />
              TechTalks
            </span>
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide text-black"
              style={{ backgroundColor: accent }}
            >
              <Trophy className="h-3.5 w-3.5" />
              {featured.parentName}
            </span>
          </div>

          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-black shadow-md transition-all hover:brightness-110 hover:shadow-lg"
            style={{ backgroundColor: accent }}
          >
            {t('viewAll')}
            <LinkPendingIndicator />
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div>
          <h2
            id={`featured-${featured.slug}`}
            className="text-2xl font-black uppercase tracking-tight text-white md:text-3xl lg:text-4xl"
          >
            {featured.name}
          </h2>
          {featured.tagline ? (
            <p className="mt-2 max-w-3xl text-sm text-white/70 md:text-base">
              {featured.tagline}
            </p>
          ) : null}
        </div>

        <div
          className={cn(
            'grid gap-6 lg:gap-8',
            groups.length && 'lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)]',
          )}
        >
          <div className="min-w-0">
            {featured.articles.length ? (
              <div className="rounded-xl border border-white/10 bg-black/20 px-4 sm:px-5">
                {featured.articles.map((article) => (
                  <FeaturedArticleRow
                    key={article.id}
                    article={article}
                    accentColor={accent}
                    readLabel={t('readReview')}
                  />
                ))}
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-white/15 bg-black/20 px-5 py-10 text-center text-sm text-white/50">
                {t('comingSoon')}
              </p>
            )}
          </div>

          {groups.length ? (
            <WorldCupGroupStandings
              groups={groups}
              accentColor={accent}
              labels={{
                title: t('worldCupStandings'),
                group: t('worldCupGroup'),
                team: t('worldCupTeam'),
                played: t('worldCupPlayed'),
                gd: t('worldCupGd'),
                points: t('worldCupPoints'),
              }}
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
