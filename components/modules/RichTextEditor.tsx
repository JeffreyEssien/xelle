"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";

interface RichTextEditorProps {
    value: string;
    onChange: (content: string) => void;
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Link.configure({
                openOnClick: false,
            }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: "prose prose-sm sm:prose-base focus:outline-none min-h-[150px] px-4 py-3 text-brand-dark max-w-none",
            },
        },
        immediatelyRender: false,
    });

    if (!editor) return null;

    return (
        <div className="border border-brand-lilac/30 rounded-sm overflow-hidden bg-white focus-within:border-brand-purple focus-within:ring-1 focus-within:ring-brand-purple transition-all">
            <div className="flex flex-wrap items-center gap-1 border-b border-brand-lilac/10 bg-neutral-50 p-2">
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive("bold")}
                    label="B"
                    title="Bold"
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive("italic")}
                    label="I"
                    title="Italic"
                />
                <div className="w-px h-4 bg-brand-lilac/20 mx-1" />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    isActive={editor.isActive("heading", { level: 2 })}
                    label="H2"
                    title="Heading 2"
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive("bulletList")}
                    label="• List"
                    title="Bullet List"
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive("orderedList")}
                    label="1. List"
                    title="Ordered List"
                />
            </div>
            <EditorContent editor={editor} />
        </div>
    );
}

function ToolbarButton({
    onClick,
    isActive,
    label,
    title,
}: {
    onClick: () => void;
    isActive: boolean;
    label: string;
    title: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={`px-2 py-1 text-xs font-medium rounded hover:bg-brand-lilac/20 transition-colors ${isActive ? "bg-brand-lilac/20 text-brand-purple" : "text-brand-dark/70"
                }`}
        >
            {label}
        </button>
    );
}
