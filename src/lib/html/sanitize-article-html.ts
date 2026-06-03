import sanitizeHtml from 'sanitize-html';

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
};

/** Sanitize Tiptap HTML before rendering on the public site (Node-safe, no jsdom). */
export function sanitizeArticleHtml(html: string): string {
  if (!html?.trim()) return '';

  try {
    return sanitizeHtml(html, {
      allowedTags: ALLOWED_TAGS,
      allowedAttributes: ALLOWED_ATTR,
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
