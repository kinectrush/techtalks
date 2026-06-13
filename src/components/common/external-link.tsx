import type { AnchorHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/utils';

type ExternalLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'href' | 'target' | 'rel' | 'children'
> & {
  href: string;
  rel?: string;
  children: ReactNode;
};

/** Standard external anchor — native behavior works best in Facebook/Zalo in-app browsers. */
export function ExternalLink({
  href,
  rel = 'noopener noreferrer',
  className,
  children,
  ...props
}: ExternalLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel={rel}
      className={cn(className)}
      {...props}
    >
      {children}
    </a>
  );
}
