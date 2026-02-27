import type { LogMessage } from "../types";

interface MessageEntryProps {
  message: LogMessage;
}

function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  const s = String(d.getSeconds()).padStart(2, "0");
  const ms = String(d.getMilliseconds()).padStart(3, "0");
  return `${h}:${m}:${s}.${ms}`;
}

const directionStyles = {
  sent: {
    align: "justify-end",
    bubble: "bg-blue-600/20 border border-blue-500/30 text-blue-100",
    label: "Sent",
  },
  received: {
    align: "justify-start",
    bubble: "bg-green-600/20 border border-green-500/30 text-green-100",
    label: "Received",
  },
  system: {
    align: "justify-center",
    bubble: "bg-gray-800 border border-gray-700 text-yellow-400",
    label: "System",
  },
} as const;

export function MessageEntry({ message }: MessageEntryProps) {
  const style = directionStyles[message.direction];

  return (
    <div className={`flex ${style.align}`}>
      <div className={`max-w-[80%] rounded px-3 py-2 text-sm ${style.bubble}`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium opacity-70">
            {style.label}
          </span>
          <span className="text-xs opacity-50 font-mono">
            {formatTimestamp(message.timestamp)}
          </span>
        </div>
        <pre className="whitespace-pre-wrap break-words font-mono text-xs">
          {message.content}
        </pre>
      </div>
    </div>
  );
}
