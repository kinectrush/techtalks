import sanitizeHtml from 'sanitize-html';

const EVAL_BOX_CLASSES = [
  'article-eval-box',
  'article-eval-box__title',
  'article-eval-box__header',
  'article-eval-box__rows',
  'article-eval-box__row',
  'article-eval-box__col',
  'article-eval-box__col--score',
  'article-eval-box__label',
  'article-eval-box__score',
] as const;

/** Editor-only; strip from published HTML if present. */
const EDITOR_ONLY_CLASSES = new Set([
  'article-eval-box--editor',
  'article-eval-box__row--editor',
]);

const TABLE_CLASSES = ['article-comparison-table'] as const;

const ALLOWED_TAGS = [
  'p',
  'h2',
  'h3',
  'h4',
  'ul',
  'ol',
  'li',
  'strong',
  'em',
  'u',
  'a',
  'blockquote',
  'br',
  'img',
  'figure',
  'figcaption',
  'hr',
  'div',
  'span',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
];

const ALLOWED_ATTR: Record<string, string[]> = {
  a: ['href', 'target', 'rel', 'title', 'class'],
  img: ['src', 'alt', 'title', 'class'],
  p: ['class'],
  h2: ['class'],
  h3: ['class'],
  h4: ['class'],
  ul: ['class'],
  ol: ['class'],
  li: ['class'],
  blockquote: ['class'],
  figure: ['class'],
  figcaption: ['class'],
  div: ['class', 'data-type'],
  span: ['class'],
  table: ['class'],
  thead: ['class'],
  tbody: ['class'],
  tr: ['class'],
  th: ['class', 'colspan', 'rowspan'],
  td: ['class', 'colspan', 'rowspan'],
};

const ALLOWED_CLASSES: Record<string, string[]> = {
  div: [...EVAL_BOX_CLASSES],
  span: [...EVAL_BOX_CLASSES],
  table: [...TABLE_CLASSES],
};

/** Sanitize Tiptap HTML before rendering on the public site (Node-safe, no jsdom). */
export function sanitizeArticleHtml(html: string): string {
  if (!html?.trim()) return '';

  try {
    return sanitizeHtml(html, {
      allowedTags: ALLOWED_TAGS,
      allowedAttributes: ALLOWED_ATTR,
      allowedClasses: ALLOWED_CLASSES,
      transformTags: {
        table: (tagName, attribs) => ({
          tagName,
          attribs: {
            ...attribs,
            class: [attribs.class, ...TABLE_CLASSES].filter(Boolean).join(' '),
          },
        }),
        div: (tagName, attribs) => {
          if (!attribs.class) return { tagName, attribs };
          const classes = attribs.class
            .split(/\s+/)
            .filter((c) => c && !EDITOR_ONLY_CLASSES.has(c));
          return {
            tagName,
            attribs: classes.length
              ? { ...attribs, class: classes.join(' ') }
              : attribs,
          };
        },
      },
      allowedSchemes: ['http', 'https', 'mailto'],
      allowedSchemesByTag: {
        img: ['http', 'https'],
      },
      allowProtocolRelative: false,
      disallowedTagsMode: 'discard',
    });
  } catch (error) {
    console.error('[sanitizeArticleHtml]', error);
    return '';
  }
}
