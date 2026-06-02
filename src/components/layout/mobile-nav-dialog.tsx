'use client';

import { Menu } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Link } from '@/i18n/navigation';

type MobileNavDialogProps = {
  homeLabel: string;
  categories: { slug: string; name: string }[];
};

export function MobileNavDialog({ homeLabel, categories }: MobileNavDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Menu">
          <Menu className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm p-0">
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle>Menu</DialogTitle>
        </DialogHeader>
        <nav className="space-y-1 px-3 py-3">
          <Link
            href="/"
            className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
            onClick={() => setOpen(false)}
          >
            {homeLabel}
          </Link>
          <div className="px-3 pt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Danh mục
          </div>
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/reviews?category=${cat.slug}`}
              className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              {cat.name}
            </Link>
          ))}
        </nav>
      </DialogContent>
    </Dialog>
  );
}

