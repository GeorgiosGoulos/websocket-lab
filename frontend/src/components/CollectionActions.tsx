import { useRef } from "react";

interface CollectionActionsProps {
  onExport: () => void;
  onImport: (file: File) => void;
}

export function CollectionActions({ onExport, onImport }: CollectionActionsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onExport}
        className="px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded text-gray-300 hover:text-gray-100 hover:border-gray-600"
      >
        Export
      </button>
      <button
        onClick={() => fileInputRef.current?.click()}
        className="px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded text-gray-300 hover:text-gray-100 hover:border-gray-600"
      >
        Import
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            onImport(file);
            e.target.value = "";
          }
        }}
      />
    </div>
  );
}
