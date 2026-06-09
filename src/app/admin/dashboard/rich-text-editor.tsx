'use client';

import React, { useRef, useEffect, useState } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  Quote, 
  Link2, 
  Image as ImageIcon, 
  Code, 
  Eye, 
  Eraser 
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onOpenMediaLibrary?: (onSelect: (url: string) => void) => void;
}

export function RichTextEditor({ value, onChange, placeholder, onOpenMediaLibrary }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isCodeView, setIsCodeView] = useState(false);
  const [htmlValue, setHtmlValue] = useState(value);
  const [savedRange, setSavedRange] = useState<Range | null>(null);

  // Sync internal HTML value with external value (only on mount or when edited externally)
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
      setHtmlValue(value);
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setHtmlValue(html);
      onChange(html);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setHtmlValue(val);
    onChange(val);
  };

  // Run format commands
  const executeCommand = (command: string, value: string = '') => {
    if (isCodeView) return;
    
    // Restore selection if we have it
    if (savedRange) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedRange);
      }
    }

    document.execCommand(command, false, value);
    handleInput();
    
    // Refocus the editor
    editorRef.current?.focus();
  };

  // Save selection before clicking buttons (crucial for inserting links and images)
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      setSavedRange(sel.getRangeAt(0));
    }
  };

  const addLink = () => {
    saveSelection();
    const url = prompt('Ingresa la URL del enlace:');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  const handleInsertImage = () => {
    if (!onOpenMediaLibrary) {
      const url = prompt('Ingresa la URL de la imagen:');
      if (url) {
        executeCommand('insertImage', url);
      }
      return;
    }

    saveSelection();
    onOpenMediaLibrary((url: string) => {
      // Restore selection and insert image
      if (savedRange) {
        const sel = window.getSelection();
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(savedRange);
        }
      }
      executeCommand('insertImage', url);
    });
  };

  return (
    <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950 focus-within:border-teal-500/50 transition-colors">
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center gap-1 bg-slate-900 border-b border-slate-800 p-2.5">
        <button
          type="button"
          onClick={() => executeCommand('bold')}
          disabled={isCodeView}
          className="p-1.5 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
          title="Negrita"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('italic')}
          disabled={isCodeView}
          className="p-1.5 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
          title="Cursiva"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('underline')}
          disabled={isCodeView}
          className="p-1.5 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
          title="Subrayado"
        >
          <Underline className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-slate-800 mx-1" />

        <button
          type="button"
          onClick={() => executeCommand('formatBlock', '<h2>')}
          disabled={isCodeView}
          className="p-1.5 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent text-xs font-bold font-mono"
          title="Título H2"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('formatBlock', '<h3>')}
          disabled={isCodeView}
          className="p-1.5 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent text-xs font-bold font-mono"
          title="Título H3"
        >
          <Heading3 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('formatBlock', '<p>')}
          disabled={isCodeView}
          className="p-1.5 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent text-xs font-bold font-mono"
          title="Párrafo"
        >
          P
        </button>

        <div className="w-px h-5 bg-slate-800 mx-1" />

        <button
          type="button"
          onClick={() => executeCommand('insertUnorderedList')}
          disabled={isCodeView}
          className="p-1.5 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
          title="Lista de Viñetas"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('insertOrderedList')}
          disabled={isCodeView}
          className="p-1.5 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
          title="Lista Numerada"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('formatBlock', '<blockquote>')}
          disabled={isCodeView}
          className="p-1.5 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
          title="Cita"
        >
          <Quote className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-slate-800 mx-1" />

        <button
          type="button"
          onMouseDown={saveSelection}
          onClick={addLink}
          disabled={isCodeView}
          className="p-1.5 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
          title="Insertar Enlace"
        >
          <Link2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onMouseDown={saveSelection}
          onClick={handleInsertImage}
          disabled={isCodeView}
          className="p-1.5 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
          title="Insertar Imagen"
        >
          <ImageIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('removeFormat')}
          disabled={isCodeView}
          className="p-1.5 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
          title="Limpiar Formato"
        >
          <Eraser className="w-4 h-4" />
        </button>

        <div className="flex-1" />

        <button
          type="button"
          onClick={() => setIsCodeView(!isCodeView)}
          className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
            isCodeView 
              ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' 
              : 'hover:bg-slate-800 text-slate-400'
          }`}
          title="Alternar Código HTML / Vista Visual"
        >
          {isCodeView ? (
            <>
              <Eye className="w-3.5 h-3.5" />
              <span>Ver Visual</span>
            </>
          ) : (
            <>
              <Code className="w-3.5 h-3.5" />
              <span>Ver HTML</span>
            </>
          )}
        </button>
      </div>

      {/* Editor Content Area */}
      <div className="p-4 bg-slate-950 min-h-[300px]">
        {isCodeView ? (
          <textarea
            value={htmlValue}
            onChange={handleCodeChange}
            placeholder={placeholder || 'Escribe código HTML crudo...'}
            className="w-full min-h-[300px] bg-transparent border-0 p-0 text-sm font-mono text-slate-200 focus:ring-0 focus:outline-hidden resize-y"
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onBlur={saveSelection}
            className="w-full min-h-[300px] outline-hidden text-sm text-slate-200 prose prose-invert max-w-none prose-headings:font-bold prose-a:text-teal-400 focus:ring-0"
            style={{ minHeight: '300px' }}
          />
        )}
      </div>
    </div>
  );
}
