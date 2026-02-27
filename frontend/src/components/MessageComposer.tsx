import { useState } from "react";

interface MessageComposerProps {
  onSend: (content: string) => void;
  disabled: boolean;
}

export function MessageComposer({ onSend, disabled }: MessageComposerProps) {
  const [content, setContent] = useState("");

  const handleSend = () => {
    const trimmed = content.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setContent("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={disabled ? "Connect to send messages" : "Type a message… (Ctrl+Enter to send)"}
        disabled={disabled}
        rows={3}
        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 placeholder-gray-500 resize-y focus:outline-none focus:border-blue-500 disabled:opacity-50 font-mono"
      />
      <button
        onClick={handleSend}
        disabled={disabled || !content.trim()}
        className="self-end px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded font-medium disabled:opacity-50"
      >
        Send
      </button>
    </div>
  );
}
