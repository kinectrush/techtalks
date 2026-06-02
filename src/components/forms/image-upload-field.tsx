'use client';

import { ImageIcon, Loader2, Upload } from 'lucide-react';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { UploadFolder } from '@/features/manage/upload/storage';
import { uploadImageClient } from '@/lib/upload-client';

type ImageUploadFieldProps = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder: UploadFolder;
  required?: boolean;
};

export function ImageUploadField({
  label,
  value,
  onChange,
  folder,
  required,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const url = await uploadImageClient(file, folder);
      onChange(url);
      toast.success('Đã tải ảnh lên');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload thất bại');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required ? ' *' : ''}
      </Label>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="relative flex h-28 w-full max-w-[200px] items-center justify-center overflow-hidden rounded-lg border bg-muted/30">
          {value ? (
            <Image
              src={value}
              alt=""
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Tải ảnh lên
            </Button>
            {value ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onChange('')}
              >
                Xóa
              </Button>
            ) : null}
          </div>
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Hoặc dán URL ảnh"
          />
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
