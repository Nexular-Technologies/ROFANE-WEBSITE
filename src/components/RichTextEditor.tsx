"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { useEffect, CSSProperties } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
}

function toolbarBtn(active?: boolean): CSSProperties {
  return {
    background: active ? "#dbeafe" : "none",
    border: `1px solid ${active ? "#93c5fd" : "transparent"}`,
    borderRadius: "5px",
    padding: "0.25rem 0.45rem",
    cursor: "pointer",
    fontSize: "0.82rem",
    lineHeight: "1.2",
    color: active ? "#1d4ed8" : "#374151",
    fontWeight: active ? 600 : 400,
    flexShrink: 0,
  };
}

const divider: CSSProperties = {
  width: "1px",
  background: "#e2e8f0",
  margin: "0 0.15rem",
  alignSelf: "stretch",
};

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Image,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        style: [
          "min-height: 220px",
          "padding: 0.75rem 1rem",
          "outline: none",
          "font-size: 0.95rem",
          "line-height: 1.65",
        ].join("; "),
      },
    },
  });

  // Sync value from parent (e.g. loading a different post)
  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!editor) {
    return (
      <div
        style={{
          border: "1px solid #cbd5e1",
          borderRadius: "8px",
          minHeight: "260px",
          background: "#fafafa",
        }}
      />
    );
  }

  const setLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Enter URL", previous ?? "");
    if (url === null) return;
    if (!url) {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const insertImage = () => {
    const url = window.prompt("Enter image URL");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  return (
    <div
      style={{
        border: "1px solid #cbd5e1",
        borderRadius: "8px",
        overflow: "hidden",
        background: "#fff",
      }}
    >
      {/* ── Toolbar ── */}
      <div
        style={{
          background: "#f8fafc",
          borderBottom: "1px solid #e2e8f0",
          padding: "0.4rem 0.5rem",
          display: "flex",
          gap: "0.15rem",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {/* Inline formatting */}
        <button type="button" style={toolbarBtn(editor.isActive("bold"))} title="Bold"
          onClick={() => editor.chain().focus().toggleBold().run()}>
          <b>B</b>
        </button>
        <button type="button" style={toolbarBtn(editor.isActive("italic"))} title="Italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}>
          <i>I</i>
        </button>
        <button type="button" style={toolbarBtn(editor.isActive("underline"))} title="Underline"
          onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <u>U</u>
        </button>
        <button type="button" style={toolbarBtn(editor.isActive("strike"))} title="Strikethrough"
          onClick={() => editor.chain().focus().toggleStrike().run()}>
          <s>S</s>
        </button>
        <button type="button" style={toolbarBtn(editor.isActive("code"))} title="Inline code"
          onClick={() => editor.chain().focus().toggleCode().run()}>
          {"</>"}
        </button>

        <div style={divider} />

        {/* Headings */}
        <button type="button" style={toolbarBtn(editor.isActive("heading", { level: 1 }))} title="Heading 1"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          H1
        </button>
        <button type="button" style={toolbarBtn(editor.isActive("heading", { level: 2 }))} title="Heading 2"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          H2
        </button>
        <button type="button" style={toolbarBtn(editor.isActive("heading", { level: 3 }))} title="Heading 3"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          H3
        </button>

        <div style={divider} />

        {/* Lists & blocks */}
        <button type="button" style={toolbarBtn(editor.isActive("bulletList"))} title="Bullet list"
          onClick={() => editor.chain().focus().toggleBulletList().run()}>
          • List
        </button>
        <button type="button" style={toolbarBtn(editor.isActive("orderedList"))} title="Ordered list"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          1. List
        </button>
        <button type="button" style={toolbarBtn(editor.isActive("blockquote"))} title="Blockquote"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          ❝
        </button>
        <button type="button" style={toolbarBtn(editor.isActive("codeBlock"))} title="Code block"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
          {"{ }"}
        </button>

        <div style={divider} />

        {/* Alignment */}
        <button type="button" style={toolbarBtn(editor.isActive({ textAlign: "left" }))} title="Align left"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}>
          ≡L
        </button>
        <button type="button" style={toolbarBtn(editor.isActive({ textAlign: "center" }))} title="Align center"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}>
          ≡C
        </button>
        <button type="button" style={toolbarBtn(editor.isActive({ textAlign: "right" }))} title="Align right"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}>
          ≡R
        </button>

        <div style={divider} />

        {/* Link & image */}
        <button type="button" style={toolbarBtn(editor.isActive("link"))} title="Insert / edit link"
          onClick={setLink}>
          Link
        </button>
        <button type="button" style={toolbarBtn()} title="Insert image"
          onClick={insertImage}>
          Img
        </button>
        <button type="button" style={toolbarBtn()} title="Horizontal rule"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          ─
        </button>

        <div style={divider} />

        {/* History */}
        <button type="button" style={toolbarBtn()} title="Undo"
          onClick={() => editor.chain().focus().undo().run()}>
          ↩
        </button>
        <button type="button" style={toolbarBtn()} title="Redo"
          onClick={() => editor.chain().focus().redo().run()}>
          ↪
        </button>
      </div>

      {/* ── Editor area ── */}
      <EditorContent editor={editor} />
    </div>
  );
}
