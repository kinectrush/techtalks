import { sanitizeArticleHtml } from '@/lib/html/sanitize-article-html';
import { cn } from '@/lib/utils';

type ArticleContentProps = {
  html: string;
  className?: string;
};

export function ArticleContent({ html, className }: ArticleContentProps) {
  const sanitized = sanitizeArticleHtml(html);

  return (
    <div
      className={cn('article-prose text-foreground', className)}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
