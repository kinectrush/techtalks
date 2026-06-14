'use client';

import { Eye } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ManagePagination } from '@/features/manage/components/manage-pagination';
import { listContactMessagesAction } from '@/features/manage/messages/actions';
import { usePendingKeys } from '@/features/manage/hooks/use-pending-keys';
import type { PaginatedResult } from '@/lib/pagination';
import type { AdminContactMessage } from '@/types/admin';

type MessagesManagerProps = {
  initialResult: PaginatedResult<AdminContactMessage>;
};

export function MessagesManager({ initialResult }: MessagesManagerProps) {
  const [result, setResult] = useState(initialResult);
  const [active, setActive] = useState<AdminContactMessage | null>(null);
  const { run, isAnyPending } = usePendingKeys();

  const messages = result.items;

  function handlePageChange(page: number) {
    void run('page', async () => {
      try {
        const data = await listContactMessagesAction(page, result.pageSize);
        setResult(data);
      } catch {
        toast.error('Không tải được danh sách tin nhắn');
      }
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tin nhắn liên hệ</h1>
        <p className="text-sm text-muted-foreground">
          Danh sách tin nhắn người dùng gửi từ footer.
        </p>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead className="w-[80px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="whitespace-normal">
                  <p className="line-clamp-2 font-medium">{m.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {m.content}
                  </p>
                </TableCell>
                <TableCell>{m.email}</TableCell>
                <TableCell>
                  {new Date(m.createdAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setActive(m)}
                    aria-label="Xem"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {messages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center">
                  <span className="text-sm text-muted-foreground">
                    Chưa có tin nhắn nào.
                  </span>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>

      <ManagePagination
        page={result.page}
        total={result.total}
        pageSize={result.pageSize}
        onPageChange={handlePageChange}
        disabled={isAnyPending}
      />

      <Dialog open={Boolean(active)} onOpenChange={() => setActive(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{active?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">{active?.email}</p>
            <p className="whitespace-pre-wrap leading-relaxed">
              {active?.content}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActive(null)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
