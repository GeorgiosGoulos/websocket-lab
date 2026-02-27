import { useCallback, useEffect, useRef, useState } from "react";
import type { LogMessage } from "../types";
import { MessageEntry } from "./MessageEntry";

interface MessageLogProps {
  messages: LogMessage[];
  onClear: () => void;
}

function isScrolledToBottom(el: HTMLElement): boolean {
  return el.scrollHeight - el.scrollTop - el.clientHeight < 40;
}

export function MessageLog({ messages, onClear }: MessageLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showNewIndicator, setShowNewIndicator] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const prevLengthRef = useRef(messages.length);
  const atBottomRef = useRef(true);

  useEffect(() => {
    const added = messages.length - prevLengthRef.current;
    prevLengthRef.current = messages.length;

    if (added <= 0) {
      setShowNewIndicator(false);
      setUnreadCount(0);
      return;
    }

    if (!atBottomRef.current) {
      setUnreadCount((prev) => prev + added);
      setShowNewIndicator(true);
    }
  }, [messages.length]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = isScrolledToBottom(el);
    atBottomRef.current = atBottom;
    if (atBottom) {
      setShowNewIndicator(false);
      setUnreadCount(0);
    }
  }, []);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView?.({ behavior: "smooth" });
    setShowNewIndicator(false);
    setUnreadCount(0);
  };

  const userMessages = messages.filter((m) => m.direction !== "system");
  const systemMessages = messages.filter((m) => m.direction === "system");

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center justify-between px-1 mb-2">
        <span className="text-sm text-gray-400">
          Messages ({userMessages.length})
        </span>
        {messages.length > 0 && (
          <button
            onClick={onClear}
            className="text-xs text-gray-500 hover:text-gray-300"
          >
            Clear
          </button>
        )}
      </div>

      {systemMessages.length > 0 && (
        <div className="px-1 mb-2 flex flex-col gap-1">
          {systemMessages.map((msg) => (
            <MessageEntry key={msg.id} message={msg} />
          ))}
        </div>
      )}

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto space-y-2 min-h-0 relative"
      >
        {userMessages.length === 0 ? (
          <p className="text-sm text-gray-600 text-center py-8">
            No messages yet
          </p>
        ) : (
          userMessages.map((msg) => (
            <MessageEntry key={msg.id} message={msg} />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {showNewIndicator && unreadCount > 0 && (
        <button
          onClick={scrollToBottom}
          className="self-center mt-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-full"
        >
          ↓ {unreadCount} new
        </button>
      )}
    </div>
  );
}
