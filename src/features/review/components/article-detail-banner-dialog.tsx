'use client';

import { XIcon } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useCallback, useRef, useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { triggerAnchorNavigation } from '@/lib/navigation/open-external-link';
import { cn } from '@/lib/utils';

type ArticleDetailBannerDialogProps = {
  imageUrl: string;
  linkUrl?: string | null;
};

const externalLinkRel = 'noopener noreferrer sponsored';

const closeButtonClass =
  'flex size-11 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-white text-foreground shadow-[0_4px_20px_rgba(0,0,0,0.35)] transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/40 focus-visible:outline-hidden';

export function ArticleDetailBannerDialog({
  imageUrl,
  linkUrl,
}: ArticleDetailBannerDialogProps) {
  const t = useTranslations('Review');
  const [open, setOpen] = useState(true);
  const href = linkUrl?.trim();
  const linkOpenedRef = useRef(false);
  const fallbackLinkRef = useRef<HTMLAnchorElement>(null);

  const closePopup = useCallback(() => {
    setOpen(false);
  }, []);

  const tryOpenLink = useCallback(() => {
    if (!href || linkOpenedRef.current) return;
    linkOpenedRef.current = true;
    triggerAnchorNavigation(fallbackLinkRef.current);
  }, [href]);

  const dismissWithLink = useCallback(() => {
    closePopup();
    tryOpenLink();
  }, [closePopup, tryOpenLink]);

  const dismissFromNativeAnchor = useCallback(() => {
    linkOpenedRef.current = true;
    closePopup();
  }, [closePopup]);

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      linkOpenedRef.current = false;
      setOpen(true);
      return;
    }

    dismissWithLink();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[min(90vw,300px)] gap-0 overflow-visible border-0 bg-transparent p-0 shadow-none sm:max-w-[300px]"
        onInteractOutside={dismissWithLink}
        onEscapeKeyDown={dismissWithLink}
      >
        <DialogTitle className="sr-only">{t('detailBannerTitle')}</DialogTitle>

        {href ? (
          <a
            ref={fallbackLinkRef}
            href={href}
            target="_blank"
            rel={externalLinkRel}
            tabIndex={-1}
            aria-hidden
            className="sr-only"
          >
            {t('detailBannerOpenLink')}
          </a>
        ) : null}

        <div className="flex w-full flex-col gap-3">
          <div className="flex justify-end">
            {href ? (
              <a
                href={href}
                target="_blank"
                rel={externalLinkRel}
                onClick={dismissFromNativeAnchor}
                className={closeButtonClass}
                aria-label={t('detailBannerClose')}
              >
                <XIcon className="size-6 stroke-[2.5]" />
              </a>
            ) : (
              <button
                type="button"
                onClick={closePopup}
                className={closeButtonClass}
                aria-label={t('detailBannerClose')}
              >
                <XIcon className="size-6 stroke-[2.5]" />
              </button>
            )}
          </div>

          <div className="relative aspect-[9/16] w-full overflow-hidden rounded-lg border bg-muted/20 shadow-lg">
            {href ? (
              <a
                href={href}
                target="_blank"
                rel={externalLinkRel}
                onClick={dismissFromNativeAnchor}
                className={cn('absolute inset-0 z-0 cursor-pointer')}
                aria-label={t('detailBannerOpenLink')}
              >
                <Image
                  src={imageUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="300px"
                  priority
                />
              </a>
            ) : (
              <Image
                src={imageUrl}
                alt=""
                fill
                className="object-cover"
                sizes="300px"
                priority
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
