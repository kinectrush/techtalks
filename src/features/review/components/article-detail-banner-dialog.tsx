'use client';

import { XIcon } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { openExternalLink } from '@/lib/navigation/open-external-link';

type ArticleDetailBannerDialogProps = {
  imageUrl: string;
  linkUrl?: string | null;
};

export function ArticleDetailBannerDialog({
  imageUrl,
  linkUrl,
}: ArticleDetailBannerDialogProps) {
  const t = useTranslations('Review');
  const [open, setOpen] = useState(true);
  const href = linkUrl?.trim();

  const dismiss = useCallback(() => {
    setOpen(false);
    if (href) openExternalLink(href);
  }, [href]);

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setOpen(true);
      return;
    }
    dismiss();
  }

  function handleBannerClick() {
    if (!href) return;
    openExternalLink(href);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[min(90vw,300px)] gap-0 overflow-visible border-0 bg-transparent p-0 shadow-none sm:max-w-[300px]"
      >
        <DialogTitle className="sr-only">{t('detailBannerTitle')}</DialogTitle>
        <div className="flex w-full flex-col gap-3">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={dismiss}
              className="flex size-11 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-white text-foreground shadow-[0_4px_20px_rgba(0,0,0,0.35)] transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/40 focus-visible:outline-hidden"
              aria-label={t('detailBannerClose')}
            >
              <XIcon className="size-6 stroke-[2.5]" />
            </button>
          </div>

          <div className="relative aspect-[9/16] w-full overflow-hidden rounded-lg border bg-muted/20 shadow-lg">
            {href ? (
              <button
                type="button"
                onClick={handleBannerClick}
                className="absolute inset-0 z-0 cursor-pointer"
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
              </button>
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
