import Image from 'next/image';
import { getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import type { ReviewSummary } from '@/types/review';

import { ArticleContent } from './article-content';
import { ReviewMeta } from './review-meta';
import { StarRating } from './star-rating';

type ReviewDetailViewProps = {
  article: ReviewSummary;
  locale: string;
};

export async function ReviewDetailView({
  article,
  locale,
}: ReviewDetailViewProps) {
  const t = await getTranslations('Review');
  const hasContent = Boolean(article.content?.trim());

  return (
    <article className="mx-auto max-w-3xl px-4 py-8 lg:py-12">
      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
        {article.isEditorPick ? (
          <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-semibold text-brand">
            {t('editorPick')}
          </span>
        ) : null}
      </div>

      <h1 className="text-3xl font-bold leading-tight tracking-tight md:text-4xl">
        {article.title}
      </h1>

      <div className="mt-4 flex flex-wrap items-center gap-4 border-b pb-6">
        <div className="flex items-center gap-2">
          {article.author.avatar ? (
            <Image
              src={article.author.avatar}
              alt={article.author.name}
              width={36}
              height={36}
              className="rounded-full object-cover"
            />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-semibold">
              {article.author.name.charAt(0)}
            </span>
          )}
          <span className="text-sm font-medium">{article.author.name}</span>
        </div>
        <StarRating rating={article.rating} size="md" />
        <ReviewMeta
          engagement={article.engagement}
          publishedAt={article.publishedAt}
          locale={locale}
        />
      </div>

      <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-xl">
        <Image
          src={article.coverImage}
          alt={article.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 768px"
          priority
        />
      </div>

      <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
        {article.excerpt}
      </p>

      {hasContent ? (
        <div className="mt-8">
          <ArticleContent html={article.content!} />
        </div>
      ) : (
        <p className="mt-8 rounded-lg border bg-muted/30 px-4 py-6 text-center text-muted-foreground">
          {t('contentEmpty')}
        </p>
      )}

      {article.tags.length > 0 ? (
        <ul className="mt-10 flex flex-wrap gap-2 border-t pt-6">
          {article.tags.map((tag) => (
            <li key={tag.slug}>
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                #{tag.name}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
