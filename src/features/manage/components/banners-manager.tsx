'use client';

import { Pencil, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  deleteBannerAction,
  listBannersAction,
  toggleBannerActiveAction,
} from '@/features/manage/banners/actions';
import { BannerFormDialog } from '@/features/manage/components/banner-form-dialog';
import { ManageActionButton } from '@/features/manage/components/manage-action-button';
import { ManagePendingOverlay } from '@/features/manage/components/manage-pending-overlay';
import { usePendingKeys } from '@/features/manage/hooks/use-pending-keys';
import { AD_BANNER_PLACEMENT_LABELS } from '@/lib/ad-banners/constants';
import type { AdBanner } from '@/types/ad-banner';

type BannersManagerProps = {
  initialBanners: AdBanner[];
};

export function BannersManager({ initialBanners }: BannersManagerProps) {
  const [banners, setBanners] = useState(initialBanners);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdBanner | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<AdBanner | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { run, isAnyPending } = usePendingKeys();

  const tableBusy = isAnyPending || isDeleting || isSaving;

  async function refresh() {
    setIsSaving(true);
    try {
      const data = await listBannersAction();
      setBanners(data);
    } catch {
      toast.error('Không tải được danh sách banner');
    } finally {
      setIsSaving(false);
    }
  }

  function openCreate() {
    if (tableBusy) return;
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(banner: AdBanner) {
    if (tableBusy) return;
    setEditing(banner);
    setDialogOpen(true);
  }

  function openDeleteDialog(banner: AdBanner) {
    if (tableBusy) return;
    setBannerToDelete(banner);
    setDeleteOpen(true);
  }

  async function confirmDelete() {
    if (!bannerToDelete) return;
    setIsDeleting(true);
    try {
      await deleteBannerAction(bannerToDelete.id);
      setBanners((prev) => prev.filter((b) => b.id !== bannerToDelete.id));
      toast.success('Đã xóa banner');
      setDeleteOpen(false);
      setBannerToDelete(null);
    } catch {
      toast.error('Xóa banner thất bại');
    } finally {
      setIsDeleting(false);
    }
  }

  function handleToggleActive(id: string, isActive: boolean) {
    void run(`toggle:${id}`, async () => {
      try {
        await toggleBannerActiveAction(id, isActive);
        const data = await listBannersAction();
        setBanners(data);
        toast.success(isActive ? 'Đã bật banner' : 'Đã tắt banner');
      } catch {
        toast.error('Cập nhật thất bại');
      }
    });
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Quản lý banner quảng cáo</h1>
            <p className="text-sm text-muted-foreground">
              Upload banner cho trang chủ và trang Reviews. Banner chi tiết bài
              viết cấu hình trong từng bài (tab Banner QC). Chỉ banner đang
              active mới hiển thị trên site.
            </p>
          </div>
          <Button onClick={openCreate} disabled={tableBusy}>
            <Plus className="h-4 w-4" />
            Tạo banner
          </Button>
        </div>

        <div className="relative rounded-lg border">
          <ManagePendingOverlay show={tableBusy} />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ảnh</TableHead>
                <TableHead>Tên</TableHead>
                <TableHead>Vị trí</TableHead>
                <TableHead>Link</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="w-[120px]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground"
                  >
                    Chưa có banner
                  </TableCell>
                </TableRow>
              ) : (
                banners.map((banner) => (
                  <TableRow key={banner.id}>
                    <TableCell>
                      <div className="relative h-14 w-24 overflow-hidden rounded border bg-muted/30">
                        <Image
                          src={banner.imageUrl}
                          alt=""
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{banner.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="max-w-[220px] whitespace-normal text-left"
                      >
                        {AD_BANNER_PLACEMENT_LABELS[banner.placement]}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[160px] truncate text-xs text-muted-foreground">
                      {banner.linkUrl ?? '—'}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={banner.isActive}
                        disabled={tableBusy}
                        onCheckedChange={(v) =>
                          handleToggleActive(banner.id, v)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <ManageActionButton
                          label="Chỉnh sửa"
                          onClick={() => openEdit(banner)}
                          disabled={tableBusy}
                        >
                          <Pencil className="h-4 w-4" />
                        </ManageActionButton>
                        <ManageActionButton
                          label="Xóa"
                          onClick={() => openDeleteDialog(banner)}
                          disabled={tableBusy}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </ManageActionButton>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <BannerFormDialog
          open={dialogOpen}
          onOpenChange={(open) => {
            if (isSaving) return;
            setDialogOpen(open);
          }}
          banner={editing}
          onSaved={refresh}
          onSavingChange={setIsSaving}
        />

        <AlertDialog
          open={deleteOpen}
          onOpenChange={(open) => {
            if (isDeleting) return;
            setDeleteOpen(open);
            if (!open) setBannerToDelete(null);
          }}
        >
          <AlertDialogContent>
            <div className="relative">
            <ManagePendingOverlay show={isDeleting} />
            <AlertDialogHeader>
              <AlertDialogTitle>Xóa banner?</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc muốn xóa &ldquo;{bannerToDelete?.name}&rdquo;? Hành
                động này không thể hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isDeleting}
                onClick={(e) => {
                  e.preventDefault();
                  void confirmDelete();
                }}
              >
                {isDeleting ? 'Đang xóa...' : 'Xóa'}
              </AlertDialogAction>
            </AlertDialogFooter>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}
