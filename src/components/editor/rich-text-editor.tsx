'use client';

import { mergeAttributes } from '@tiptap/core';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  Link2,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  TableProperties,
  Underline as UnderlineIcon,
} from 'lucide-react';
import { useCallback, useRef, type ReactNode } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { EvaluationBox } from '@/components/editor/extensions/evaluation-box';
import { uploadImageClient } from '@/lib/upload-client';
import { cn } from '@/lib/utils';

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
};

function ToolbarButton({
  active,
  onClick,
  children,
  title,
}: {
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
  title: string;
}) {
  return (
    <Button
      type="button"
      variant={active ? 'secondary' : 'ghost'}
      size="icon"
      className="h-8 w-8"
      title={title}
      onMouseDown={(e) => {
        // Keep editor selection (avoid blur/reset before command runs)
        e.preventDefault();
        onClick();
      }}
    >
      {children}
    </Button>
  );
}

const LinkedImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      href: {
        default: null,
        // When rendered, images are wrapped by <a href="..."><img /></a>.
        // Parse href from the parent <a>, not from <img>.
        parseHTML: (element) => {
          const el = element as HTMLElement;
          const parent = el.parentElement;
          const href =
            parent?.tagName === 'A'
              ? parent.getAttribute('href')
              : el.getAttribute('href');
          return href ? href : null;
        },
      },
      target: {
        default: '_blank',
      },
    };
  },
  renderHTML({ HTMLAttributes }) {
    const { href, target, ...imgAttrs } = HTMLAttributes as Record<string, string>;
    const mergedImgAttrs = mergeAttributes(imgAttrs);
    if (href) {
      return [
        'a',
        {
          href,
          target: target || '_blank',
          rel: 'noopener noreferrer',
        },
        ['img', mergedImgAttrs],
      ];
    }
    return ['img', mergedImgAttrs];
  },
});

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Viết nội dung bài viết...',
  className,
}: RichTextEditorProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      Link.configure({ openOnClick: false }),
      LinkedImage.configure({ inline: false, allowBase64: false }),
      EvaluationBox,
      Placeholder.configure({ placeholder }),
    ],
    content: value || '',
    immediatelyRender: false,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'tiptap prose prose-sm max-w-none min-h-[280px] px-4 py-3 focus:outline-none',
      },
    },
  });

  const insertImage = useCallback(
    async (file: File) => {
      if (!editor) return;
      try {
        const url = await uploadImageClient(file, 'content');
        editor.chain().focus().setImage({ src: url, alt: file.name }).run();
        toast.success('Đã chèn ảnh');
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Upload ảnh thất bại');
      }
    },
    [editor],
  );

  const insertImageByUrl = useCallback(
    (url: string) => {
      if (!editor) return;
      const trimmed = url.trim();
      if (!trimmed) return;
      if (!/^https?:\/\//i.test(trimmed)) {
        toast.error('URL ảnh phải bắt đầu bằng http/https');
        return;
      }
      editor.chain().focus().setImage({ src: trimmed, alt: 'image' }).run();
      toast.success('Đã chèn ảnh từ link');
    },
    [editor],
  );

  if (!editor) {
    return (
      <div className="h-[320px] animate-pulse rounded-lg border bg-muted" />
    );
  }

  return (
    <div
      className={cn(
        'flex max-h-[70vh] flex-col overflow-hidden rounded-lg border bg-background',
        className,
      )}
    >
      <div className="sticky top-0 z-20 flex flex-wrap gap-0.5 border-b bg-muted/30 p-1 backdrop-blur supports-[backdrop-filter]:bg-muted/20">
        <ToolbarButton
          title="In đậm"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="In nghiêng"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Gạch chân"
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Tiêu đề H2"
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Tiêu đề H3"
          active={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Danh sách"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Danh sách số"
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Trích dẫn"
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Chèn bảng điểm"
          active={editor.isActive('evaluationBox')}
          onClick={() => editor.chain().focus().insertEvaluationBox().run()}
        >
          <TableProperties className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Liên kết"
          active={editor.isActive('link')}
          onClick={() => {
            const prev = editor.getAttributes('link').href as string | undefined;
            const url = window.prompt('URL', prev ?? 'https://');
            if (url === null) return;
            if (url === '') {
              editor.chain().focus().extendMarkRange('link').unsetLink().run();
              return;
            }
            editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
          }}
        >
          <Link2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Gắn link cho ảnh"
          active={editor.isActive('image') && Boolean(editor.getAttributes('image').href)}
          onClick={() => {
            if (!editor.isActive('image')) {
              toast.error('Hãy chọn 1 ảnh trong nội dung trước');
              return;
            }
            const prev = editor.getAttributes('image').href as string | undefined;
            const url = window.prompt('URL khi click ảnh', prev ?? 'https://');
            if (url === null) return;
            const trimmed = url.trim();
            if (trimmed === '') {
              editor.chain().focus().updateAttributes('image', { href: null }).run();
              return;
            }
            if (!/^https?:\/\//i.test(trimmed)) {
              toast.error('URL phải bắt đầu bằng http/https');
              return;
            }
            editor
              .chain()
              .focus()
              .updateAttributes('image', { href: trimmed, target: '_blank' })
              .run();
            toast.success('Đã gắn link cho ảnh');
          }}
        >
          <Link2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Upload ảnh"
          onClick={() => fileRef.current?.click()}
        >
          <ImageIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Chèn ảnh từ link"
          onClick={() => {
            const url = window.prompt('Dán link ảnh (http/https)', 'https://');
            if (url === null) return;
            insertImageByUrl(url);
          }}
        >
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void insertImage(file);
          e.target.value = '';
        }}
      />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
