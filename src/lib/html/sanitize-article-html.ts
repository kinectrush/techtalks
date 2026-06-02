import DOMPurify from 'isomorphic-dompurify';

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

const ALLOWED_ATTR = ['href', 'target', 'rel', 'src', 'alt', 'title', 'class'];

/** Sanitize Tiptap HTML before rendering on the public site. */
export function sanitizeArticleHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
  });
}
