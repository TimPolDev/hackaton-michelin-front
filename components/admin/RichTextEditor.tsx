'use client';

import * as React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';

export interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4',
      },
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-gray-300 rounded-md overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-3 py-1 rounded text-sm font-semibold ${
            editor.isActive('bold') ? 'bg-gray-300' : 'bg-white hover:bg-gray-100'
          }`}
          title="Gras"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-3 py-1 rounded text-sm italic ${
            editor.isActive('italic') ? 'bg-gray-300' : 'bg-white hover:bg-gray-100'
          }`}
          title="Italique"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`px-3 py-1 rounded text-sm line-through ${
            editor.isActive('strike') ? 'bg-gray-300' : 'bg-white hover:bg-gray-100'
          }`}
          title="Barré"
        >
          S
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-3 py-1 rounded text-sm ${
            editor.isActive('heading', { level: 2 }) ? 'bg-gray-300' : 'bg-white hover:bg-gray-100'
          }`}
          title="Titre"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-3 py-1 rounded text-sm ${
            editor.isActive('heading', { level: 3 }) ? 'bg-gray-300' : 'bg-white hover:bg-gray-100'
          }`}
          title="Sous-titre"
        >
          H3
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-3 py-1 rounded text-sm ${
            editor.isActive('bulletList') ? 'bg-gray-300' : 'bg-white hover:bg-gray-100'
          }`}
          title="Liste à puces"
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-3 py-1 rounded text-sm ${
            editor.isActive('orderedList') ? 'bg-gray-300' : 'bg-white hover:bg-gray-100'
          }`}
          title="Liste numérotée"
        >
          1. List
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <button
          type="button"
          onClick={() => {
            const url = window.prompt('URL:');
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          className={`px-3 py-1 rounded text-sm ${
            editor.isActive('link') ? 'bg-gray-300' : 'bg-white hover:bg-gray-100'
          }`}
          title="Lien"
        >
          Link
        </button>
      </div>

      {/* Editor content */}
      <EditorContent editor={editor} />

      {placeholder && !content && (
        <div className="absolute top-14 left-4 text-gray-400 pointer-events-none">
          {placeholder}
        </div>
      )}
    </div>
  );
}
