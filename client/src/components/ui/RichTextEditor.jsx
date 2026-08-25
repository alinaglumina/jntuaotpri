import { useRef, useEffect } from 'react';
// Lightweight, dependency-free rich-text editor (contentEditable + a small
// toolbar). Emits sanitized-on-save HTML via onChange. Swap for Quill later if
// desired — the value contract (HTML string) stays the same.
const TOOLS = [
  ['bold', 'fa-bold'], ['italic', 'fa-italic'], ['underline', 'fa-underline'],
  ['insertUnorderedList', 'fa-list-ul'], ['insertOrderedList', 'fa-list-ol'],
  ['formatBlock:h3', 'fa-heading'], ['createLink', 'fa-link'], ['removeFormat', 'fa-eraser'],
];
export default function RichTextEditor({ value = '', onChange, minHeight = 160 }) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current && ref.current.innerHTML !== value) ref.current.innerHTML = value || ''; }, [value]);
  const exec = (cmd) => {
    const [command, arg] = cmd.split(':');
    if (command === 'createLink') { const url = prompt('Link URL:'); if (url) document.execCommand(command, false, url); }
    else document.execCommand(command, false, arg || null);
    ref.current?.focus();
    onChange?.(ref.current?.innerHTML || '');
  };
  return (
    <div className="rounded-md border border-slate-300 focus-within:border-navy focus-within:ring-2 focus-within:ring-crimson/30">
      <div className="flex flex-wrap gap-1 border-b border-slate-200 bg-slate-50 p-1">
        {TOOLS.map(([cmd, icon]) => (
          <button key={cmd} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => exec(cmd)} className="grid h-8 w-8 place-items-center rounded text-slate-600 hover:bg-navy hover:text-white" aria-label={cmd}>
            <i className={`fa-solid ${icon} text-xs`} aria-hidden="true" />
          </button>
        ))}
      </div>
      <div
        ref={ref} contentEditable suppressContentEditableWarning
        onInput={() => onChange?.(ref.current?.innerHTML || '')}
        className="prose-jntua max-w-none px-3 py-2 text-sm focus:outline-none"
        style={{ minHeight }}
      />
    </div>
  );
}
