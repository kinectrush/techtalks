'use client';

import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from 'react';

import { isInAppBrowser } from '@/lib/navigation/in-app-browser';
import { openExternalLink } from '@/lib/navigation/open-external-link';
import { cn } from '@/lib/utils';

type ExternalLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'href' | 'target' | 'rel' | 'children'
> & {
  href: string;
  rel?: string;
  children: ReactNode;
};

export function ExternalLink({
  href,
  rel = 'noopener noreferrer',
  className,
  onClick,
  children,
  ...props
}: ExternalLinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (event.defaultPrevented) return;

    if (!isInAppBrowser()) return;

    event.preventDefault();
    openExternalLink(href);
  }

  return (
    <a
      href={href}
      target="_blank"
      rel={rel}
      className={cn(className)}
      onClick={handleClick}
      {...props}
    >
      {children}
    </a>
  );
}
