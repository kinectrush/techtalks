'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  contactMessageSchema,
  type ContactMessageValues,
} from '@/features/contact/schema';
import { submitContactMessageAction } from '@/features/contact/actions';

type ContactMessageDialogProps = {
  label?: string;
  className?: string;
};

export function ContactMessageDialog({
  label = 'Liên hệ',
  className,
}: ContactMessageDialogProps) {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactMessageValues>({
    resolver: zodResolver(contactMessageSchema),
    defaultValues: { title: '', email: '', content: '' },
  });

  async function onSubmit(values: ContactMessageValues) {
    try {
      await submitContactMessageAction(values);
      toast.success('Đã gửi tin nhắn');
      reset();
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Gửi thất bại');
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className={className}>
          <MessageCircle className="h-4 w-4" />
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Gửi tin nhắn</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contact-title">Tiêu đề *</Label>
            <Input id="contact-title" {...register('title')} />
            {errors.title ? (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-email">Email liên hệ *</Label>
            <Input id="contact-email" type="email" {...register('email')} />
            {errors.email ? (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-content">Nội dung *</Label>
            <Textarea id="contact-content" rows={6} {...register('content')} />
            {errors.content ? (
              <p className="text-sm text-destructive">
                {errors.content.message}
              </p>
            ) : null}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Đang gửi...' : 'Gửi'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

