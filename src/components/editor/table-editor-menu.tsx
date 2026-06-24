'use client';

import type { Editor } from '@tiptap/react';
import { Table, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

type TableEditorMenuProps = {
  editor: Editor;
};

const MIN_SIZE = 1;
const MAX_ROWS = 12;
const MAX_COLS = 8;

function applyEqualColumnWidths(editor: Editor, cols: number) {
  if (cols < 1) return;

  const editorEl = editor.view.dom.closest('.rich-text-editor');
  const availableWidth = editorEl?.clientWidth ?? editor.view.dom.clientWidth;
  const colWidth = Math.max(48, Math.floor(availableWidth / cols));

  const { state } = editor;
  const { $from } = state.selection;

  for (let depth = $from.depth; depth > 0; depth -= 1) {
    const table = $from.node(depth);
    if (table.type.name !== 'table') continue;

    const tableContentStart = $from.start(depth);
    const updates: { pos: number; attrs: Record<string, unknown> }[] = [];

    table.descendants((cell, pos) => {
      if (cell.type.name !== 'tableCell' && cell.type.name !== 'tableHeader') {
        return;
      }
      if (cell.attrs.colspan !== 1) return;

      updates.push({
        pos: tableContentStart + pos,
        attrs: { ...cell.attrs, colwidth: [colWidth] },
      });
    });

    if (updates.length === 0) break;

    let tr = state.tr;
    for (let i = updates.length - 1; i >= 0; i -= 1) {
      const { pos, attrs } = updates[i];
      tr = tr.setNodeMarkup(pos, undefined, attrs);
    }
    editor.view.dispatch(tr);
    break;
  }
}

function deleteCurrentTable(editor: Editor) {
  if (editor.chain().focus().deleteTable().run()) {
    return true;
  }

  const { state } = editor;
  const { $from } = state.selection;

  for (let depth = $from.depth; depth > 0; depth -= 1) {
    const node = $from.node(depth);
    if (node.type.name !== 'table') continue;

    const pos = $from.before(depth);
    editor.view.dispatch(state.tr.delete(pos, pos + node.nodeSize));
    return true;
  }

  return false;
}

export function TableEditorMenu({ editor }: TableEditorMenuProps) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [withHeaderRow, setWithHeaderRow] = useState(true);
  const [inTable, setInTable] = useState(() => editor.isActive('table'));

  useEffect(() => {
    const sync = () => setInTable(editor.isActive('table'));
    editor.on('selectionUpdate', sync);
    editor.on('transaction', sync);
    return () => {
      editor.off('selectionUpdate', sync);
      editor.off('transaction', sync);
    };
  }, [editor]);

  const insertTable = () => {
    const inserted = editor
      .chain()
      .focus()
      .insertTable({
        rows,
        cols,
        withHeaderRow,
      })
      .run();

    if (inserted) {
      requestAnimationFrame(() => {
        applyEqualColumnWidths(editor, cols);
      });
    }

    setOpen(false);
  };

  const handleDeleteTable = () => {
    const deleted = deleteCurrentTable(editor);
    if (!deleted) {
      toast.error('Đặt con trỏ trong bảng rồi thử lại');
    }
  };

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant={inTable ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            title="Chèn bảng"
            onMouseDown={(e) => e.preventDefault()}
          >
            <Table className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-56 space-y-3 p-3"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <p className="text-sm font-medium">Chèn bảng so sánh</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="table-rows" className="text-xs">
                Hàng
              </Label>
              <Input
                id="table-rows"
                type="number"
                min={MIN_SIZE}
                max={MAX_ROWS}
                value={rows}
                onChange={(e) => {
                  const next = Number.parseInt(e.target.value, 10);
                  if (Number.isNaN(next)) return;
                  setRows(Math.min(MAX_ROWS, Math.max(MIN_SIZE, next)));
                }}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="table-cols" className="text-xs">
                Cột
              </Label>
              <Input
                id="table-cols"
                type="number"
                min={MIN_SIZE}
                max={MAX_COLS}
                value={cols}
                onChange={(e) => {
                  const next = Number.parseInt(e.target.value, 10);
                  if (Number.isNaN(next)) return;
                  setCols(Math.min(MAX_COLS, Math.max(MIN_SIZE, next)));
                }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="table-header-row" className="text-xs">
              Hàng tiêu đề
            </Label>
            <Switch
              id="table-header-row"
              checked={withHeaderRow}
              onCheckedChange={setWithHeaderRow}
            />
          </div>
          <Button type="button" size="sm" className="w-full" onClick={insertTable}>
            Chèn bảng
          </Button>
        </DropdownMenuContent>
      </DropdownMenu>

      {inTable ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
          title="Xóa bảng"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleDeleteTable}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ) : null}
    </>
  );
}
