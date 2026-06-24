import { Table, TableView } from '@tiptap/extension-table';

export const ComparisonTable = Table.extend({
  addNodeView() {
    const isResizable = this.options.resizable && this.editor.isEditable;
    if (isResizable) {
      return null;
    }

    const View = this.options.View ?? TableView;

    return ({ node, view }) => {
      const nodeView = new View(node, this.options.cellMinWidth, view) as TableView;
      nodeView.table.classList.add(
        'article-comparison-table',
        'article-comparison-table--editor',
      );
      nodeView.dom.classList.add('article-comparison-table__wrapper');
      return nodeView;
    };
  },
});
