import { useState, useRef, useEffect } from "react";
import type { Collection } from "../types";

interface CollectionSidebarProps {
  collections: Collection[];
  activeCollectionId: string;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
}

export function CollectionSidebar({
  collections,
  activeCollectionId,
  isOpen,
  onToggle,
  onSelect,
  onAdd,
  onDelete,
  onRename,
}: CollectionSidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const startRename = (collection: Collection) => {
    setEditingId(collection.id);
    setEditValue(collection.name);
  };

  const commitRename = () => {
    if (editingId && editValue.trim()) {
      onRename(editingId, editValue.trim());
    }
    setEditingId(null);
  };

  if (!isOpen) {
    return (
      <div className="w-10 border-r border-gray-800 bg-gray-950 flex flex-col items-center pt-3 shrink-0">
        <button
          onClick={onToggle}
          className="text-gray-400 hover:text-gray-200 text-sm"
          aria-label="Open sidebar"
        >
          &#x25B6;
        </button>
      </div>
    );
  }

  return (
    <div className="w-64 border-r border-gray-800 bg-gray-950 flex flex-col shrink-0">
      <div className="flex items-center justify-between px-3 py-3 border-b border-gray-800">
        <span className="text-sm font-medium text-gray-400">Collections</span>
        <button
          onClick={onToggle}
          className="text-gray-400 hover:text-gray-200 text-sm"
          aria-label="Close sidebar"
        >
          &#x25C0;
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {collections.map((col) => (
          <div
            key={col.id}
            className={`group flex items-center gap-1 px-3 py-2 cursor-pointer text-sm ${
              col.id === activeCollectionId
                ? "bg-gray-800 text-blue-400"
                : "text-gray-400 hover:bg-gray-900 hover:text-gray-200"
            }`}
            onClick={() => onSelect(col.id)}
            onDoubleClick={() => startRename(col)}
          >
            {editingId === col.id ? (
              <input
                ref={inputRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={commitRename}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitRename();
                  if (e.key === "Escape") setEditingId(null);
                }}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 bg-gray-700 border border-gray-600 rounded px-1 py-0.5 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
              />
            ) : (
              <span className="flex-1 truncate">{col.name}</span>
            )}
            {collections.length > 1 && editingId !== col.id && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(col.id);
                }}
                className="hidden group-hover:block text-gray-500 hover:text-gray-300"
                aria-label={`Delete ${col.name}`}
              >
                &times;
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={onAdd}
        className="px-3 py-2 text-sm text-gray-500 hover:text-gray-300 border-t border-gray-800 text-left"
      >
        + New Collection
      </button>
    </div>
  );
}
