import { useCallback, useEffect, useRef, useState } from "react";
import type { ConnectionStatus, LogMessage } from "../types";

let nextId = 0;
function generateId(): string {
  return `msg-${Date.now()}-${nextId++}`;
}

export function useWebSocket() {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [messages, setMessages] = useState<LogMessage[]>([]);
  const socketRef = useRef<WebSocket | null>(null);

  const connect = useCallback((url: string, protocols?: string[], onConnected?: (ws: WebSocket) => void) => {
    if (socketRef.current) {
      socketRef.current.close();
    }

    setStatus("connecting");

    const socket = protocols
      ? new WebSocket(url, protocols)
      : new WebSocket(url);

    socket.onopen = () => {
      setStatus("connected");
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          direction: "system",
          content: `Connected to ${url}`,
          timestamp: Date.now(),
        },
      ]);
      onConnected?.(socket);
    };

    socket.onmessage = (event: MessageEvent) => {
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          direction: "received",
          content: String(event.data),
          timestamp: Date.now(),
        },
      ]);
    };

    socket.onclose = (event: CloseEvent) => {
      setStatus("disconnected");
      socketRef.current = null;
      const parts = [`Connection closed (code ${event.code})`];
      if (event.reason) parts.push(`: ${event.reason}`);
      if (!event.wasClean) parts.push(" — unexpected close");
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          direction: "system",
          content: parts.join(""),
          timestamp: Date.now(),
        },
      ]);
    };

    socket.onerror = () => {
      setStatus("error");
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          direction: "system",
          content: "WebSocket error — check the endpoint URL and that the server is running",
          timestamp: Date.now(),
        },
      ]);
    };

    socketRef.current = socket;
  }, []);

  const disconnect = useCallback(() => {
    socketRef.current?.close();
  }, []);

  const send = useCallback((content: string) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      return;
    }
    socketRef.current.send(content);
    setMessages((prev) => [
      ...prev,
      {
        id: generateId(),
        direction: "sent",
        content,
        timestamp: Date.now(),
      },
    ]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  useEffect(() => {
    return () => {
      socketRef.current?.close();
    };
  }, []);

  return { status, messages, connect, disconnect, send, clearMessages };
}
