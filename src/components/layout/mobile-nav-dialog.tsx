'use client';

import { Menu, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

const MOBILE_NAV_ITEMS = [
  { label: 'Trang Chủ', href: '/' },
  { label: 'Công Nghệ', href: '/reviews?category=cong-nghe' },
  { label: 'Thể thao', href: '/reviews?category=the-thao' },
] as const;

const DRAWER_MS = 380;
const DRAWER_EASE = 'cubic-bezier(0.32, 0.72, 0, 1)';

export function MobileNavDialog() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const drawerActiveRef = useRef(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    if (open) {
      drawerActiveRef.current = true;
      setMounted(true);
      document.body.style.overflow = 'hidden';
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    }

    if (!drawerActiveRef.current) return;

    setVisible(false);
    const timer = window.setTimeout(() => {
      drawerActiveRef.current = false;
      setMounted(false);
      document.body.style.overflow = '';
    }, DRAWER_MS);

    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, close]);

  const panel =
    portalReady && mounted
      ? createPortal(
          <div className="fixed inset-0 z-50 md:hidden" role="presentation">
            <button
              type="button"
              aria-label="Đóng menu"
              className={cn(
                'absolute inset-0 cursor-pointer bg-black/50 transition-opacity will-change-[opacity]',
                visible ? 'opacity-100' : 'opacity-0',
              )}
              style={{
                transitionDuration: `${DRAWER_MS}ms`,
                transitionTimingFunction: DRAWER_EASE,
              }}
              onClick={close}
            />
            <aside
              role="dialog"
              aria-modal="true"
              aria-label="Điều hướng"
              className={cn(
                'absolute inset-y-0 right-0 flex h-dvh w-full flex-col border-l bg-background shadow-xl will-change-transform',
                visible ? 'translate-x-0' : 'translate-x-full',
              )}
              style={{
                transitionProperty: 'transform',
                transitionDuration: `${DRAWER_MS}ms`,
                transitionTimingFunction: DRAWER_EASE,
              }}
            >
              <div className="flex shrink-0 justify-end border-b px-3 py-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Đóng menu"
                  onClick={close}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
                {MOBILE_NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block cursor-pointer rounded-md px-3 py-3 text-base font-medium hover:bg-muted"
                    onClick={close}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </aside>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>
      {panel}
    </>
  );
}
