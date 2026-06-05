import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

import { EvaluationBoxView } from '@/components/editor/evaluation-box-view';

export type EvaluationRow = {
  label: string;
  score: string;
};

export const DEFAULT_EVALUATION_ROWS: EvaluationRow[] = [
  { label: 'Độ êm', score: '8/10' },
  { label: 'Độ nảy', score: '7.5/10' },
  { label: 'Độ ổn định', score: '9/10' },
  { label: 'Độ bền', score: '9.5/10' },
  { label: 'Đa dụng', score: '9/10' },
  { label: 'Giá trị/giá tiền', score: '10/10' },
];

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    evaluationBox: {
      insertEvaluationBox: () => ReturnType;
    };
  }
}

function parseRows(value: unknown): EvaluationRow[] {
  if (!Array.isArray(value)) return DEFAULT_EVALUATION_ROWS;
  const rows = value
    .map((row) => {
      if (!row || typeof row !== 'object') return null;
      const label = 'label' in row ? String(row.label) : '';
      const score = 'score' in row ? String(row.score) : '';
      if (!label.trim() && !score.trim()) return null;
      return { label, score };
    })
    .filter((row): row is EvaluationRow => row !== null);
  return rows.length ? rows : DEFAULT_EVALUATION_ROWS;
}

function renderEvaluationBoxHtml(rows: EvaluationRow[]) {
  const rowElements = rows.map((row) => [
    'div',
    { class: 'article-eval-box__row' },
    ['span', { class: 'article-eval-box__label' }, row.label],
    ['span', { class: 'article-eval-box__score' }, row.score],
  ]);

  return [
    'div',
    { class: 'article-eval-box', 'data-type': 'evaluation-box' },
    [
      'div',
      { class: 'article-eval-box__header' },
      ['span', { class: 'article-eval-box__col' }, 'Tiêu chí'],
      ['span', { class: 'article-eval-box__col article-eval-box__col--score' }, 'Điểm'],
    ],
    ['div', { class: 'article-eval-box__rows' }, ...rowElements],
  ] as const;
}

export const EvaluationBox = Node.create({
  name: 'evaluationBox',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      rows: {
        default: DEFAULT_EVALUATION_ROWS,
        parseHTML: (element) => {
          const rowEls = element.querySelectorAll('.article-eval-box__row');
          const rows = Array.from(rowEls).map((row) => ({
            label:
              row.querySelector('.article-eval-box__label')?.textContent?.trim() ?? '',
            score:
              row.querySelector('.article-eval-box__score')?.textContent?.trim() ?? '',
          }));
          return parseRows(rows);
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div.article-eval-box',
        getAttrs: (element) => {
          const el = element as HTMLElement;
          const rows = Array.from(el.querySelectorAll('.article-eval-box__row')).map(
            (row) => ({
              label:
                row.querySelector('.article-eval-box__label')?.textContent?.trim() ?? '',
              score:
                row.querySelector('.article-eval-box__score')?.textContent?.trim() ?? '',
            }),
          );
          return { rows: parseRows(rows) };
        },
      },
    ];
  },

  renderHTML({ node }) {
    const rows = parseRows(node.attrs.rows);
    return renderEvaluationBoxHtml(rows);
  },

  addNodeView() {
    return ReactNodeViewRenderer(EvaluationBoxView);
  },

  addCommands() {
    return {
      insertEvaluationBox:
        () =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: { rows: DEFAULT_EVALUATION_ROWS },
          }),
    };
  },
});
