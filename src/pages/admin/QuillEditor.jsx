/**
 * QuillEditor — Gmail-like rich-text editor on Quill 2 (mature, structured
 * output). Toolbar is deliberately email-focused: paragraphs/headings, bold,
 * italic, underline, lists, links, image insert, undo/redo, clear formatting.
 *
 * Images are inserted as HTTPS URLs returned by the backend upload endpoint
 * (never base64 into the document). The generated HTML is sanitized
 * SERVER-SIDE before storing and before sending; this component is UX only.
 */
import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

const TOOLBAR = [
  [{ header: [false, 2, 3] }],
  ['bold', 'italic', 'underline'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['link', 'image'],
  ['clean'],
];

const QuillEditor = forwardRef(function QuillEditor(
  { initialHtml = '', onChange, onRequestImage, placeholder },
  ref
) {
  const containerRef = useRef(null);
  const quillRef = useRef(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onRequestImageRef = useRef(onRequestImage);
  onRequestImageRef.current = onRequestImage;

  useEffect(() => {
    if (!containerRef.current || quillRef.current) return;
    const editorEl = document.createElement('div');
    containerRef.current.appendChild(editorEl);

    const quill = new Quill(editorEl, {
      theme: 'snow',
      placeholder: placeholder || 'Write your email…',
      modules: {
        toolbar: { container: TOOLBAR },
        history: { delay: 400, maxStack: 200, userOnly: true },
      },
    });
    // The image button delegates to the app's validated upload flow instead
    // of Quill's default base64 embedding.
    quill.getModule('toolbar').addHandler('image', () => {
      if (onRequestImageRef.current) onRequestImageRef.current();
    });

    if (initialHtml) {
      quill.clipboard.dangerouslyPasteHTML(initialHtml);
      quill.history.clear();
    }
    quill.on('text-change', () => {
      if (onChangeRef.current) onChangeRef.current(quill.getSemanticHTML(), quill.getText());
    });
    quillRef.current = quill;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useImperativeHandle(ref, () => ({
    /** Insert an uploaded image (HTTPS URL) at the cursor with alt + width. */
    insertImage(url, alt, widthPx) {
      const quill = quillRef.current;
      if (!quill) return;
      const range = quill.getSelection(true) || { index: quill.getLength() };
      quill.insertEmbed(range.index, 'image', url, 'user');
      quill.setSelection(range.index + 1, 0);
      requestAnimationFrame(() => {
        quill.root.querySelectorAll('img').forEach((img) => {
          if (img.getAttribute('src') !== url) return;
          if (alt) img.setAttribute('alt', alt);
          img.setAttribute('style', `max-width:${widthPx ? `${widthPx}px` : '100%'};width:100%;height:auto;`);
        });
        if (onChangeRef.current) onChangeRef.current(quill.getSemanticHTML(), quill.getText());
      });
    },
    getHtml() {
      return quillRef.current ? quillRef.current.getSemanticHTML() : '';
    },
    setHtml(html) {
      const quill = quillRef.current;
      if (!quill) return;
      quill.setContents([]);
      if (html) quill.clipboard.dangerouslyPasteHTML(html);
    },
    undo() { quillRef.current?.history.undo(); },
    redo() { quillRef.current?.history.redo(); },
  }), []);

  return (
    <div
      ref={containerRef}
      className="landing-admin-quill rounded-lg border border-light-border bg-white [&_.ql-toolbar]:rounded-t-lg [&_.ql-toolbar]:border-light-border [&_.ql-container]:rounded-b-lg [&_.ql-container]:border-light-border [&_.ql-container]:min-h-[220px] [&_.ql-editor]:min-h-[220px] [&_.ql-editor]:text-sm"
      data-testid="quill-editor"
    />
  );
});

export default QuillEditor;
