'use client';

import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DEFAULT_EVALUATION_ROWS,
  type EvaluationRow,
} from '@/components/editor/extensions/evaluation-box';

function parseRows(value: unknown): EvaluationRow[] {
  if (!Array.isArray(value)) return DEFAULT_EVALUATION_ROWS;
  const rows = value
    .map((row) => {
      if (!row || typeof row !== 'object') return null;
      const label = 'label' in row ? String(row.label) : '';
      const score = 'score' in row ? String(row.score) : '';
      return { label, score };
    })
    .filter((row): row is EvaluationRow => row !== null);
  return rows.length ? rows : [{ label: '', score: '' }];
}

export function EvaluationBoxView({ node, updateAttributes }: NodeViewProps) {
  const rows = parseRows(node.attrs.rows);

  const setRows = (nextRows: EvaluationRow[]) => {
    updateAttributes({ rows: nextRows });
  };

  return (
    <NodeViewWrapper className="my-4" data-drag-handle>
      <div className="article-eval-box article-eval-box--editor">
        <div className="article-eval-box__header">
          <span className="article-eval-box__col">Tiêu chí</span>
          <span className="article-eval-box__col article-eval-box__col--score">
            Điểm
          </span>
        </div>

        <div className="article-eval-box__rows">
          {rows.map((row, index) => (
            <div key={index} className="article-eval-box__row article-eval-box__row--editor">
              <Input
                value={row.label}
                onChange={(e) => {
                  const next = [...rows];
                  next[index] = { ...next[index], label: e.target.value };
                  setRows(next);
                }}
                className="article-eval-box__field h-8 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                placeholder="Tiêu chí"
              />
              <div className="flex items-center gap-1">
                <Input
                  value={row.score}
                  onChange={(e) => {
                    const next = [...rows];
                    next[index] = { ...next[index], score: e.target.value };
                    setRows(next);
                  }}
                  className="article-eval-box__field article-eval-box__field--score h-8 w-20 border-0 bg-transparent px-0 text-right shadow-none focus-visible:ring-0"
                  placeholder="8/10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  title="Xóa dòng"
                  disabled={rows.length <= 1}
                  onClick={() => setRows(rows.filter((_, i) => i !== index))}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-2 h-8"
          onClick={() => setRows([...rows, { label: '', score: '' }])}
        >
          <Plus className="h-4 w-4" />
          Thêm tiêu chí
        </Button>
      </div>
    </NodeViewWrapper>
  );
}
