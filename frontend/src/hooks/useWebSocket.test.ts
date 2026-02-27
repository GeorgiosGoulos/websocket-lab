import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useWebSocket } from "./useWebSocket";

class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  CONNECTING = 0;
  OPEN = 1;
  CLOSING = 2;
  CLOSED = 3;

  url: string;
  protocols: string | string[] | undefined;
  readyState: number = MockWebSocket.CONNECTING;
  onopen: ((ev: Event) => void) | null = null;
  onmessage: ((ev: MessageEvent) => void) | null = null;
  onclose: ((ev: CloseEvent) => void) | null = null;
  onerror: ((ev: Event) => void) | null = null;
  send = vi.fn();
  close = vi.fn().mockImplementation((code?: number, reason?: string) => {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.(
      new CloseEvent("close", { code: code ?? 1000, reason: reason ?? "", wasClean: true }),
    );
  });

  constructor(url: string, protocols?: string | string[]) {
    this.url = url;
    this.protocols = protocols;
    MockWebSocket.instances.push(this);
  }

  simulateOpen() {
    this.readyState = MockWebSocket.OPEN;
    this.onopen?.(new Event("open"));
  }

  simulateMessage(data: string) {
    this.onmessage?.(new MessageEvent("message", { data }));
  }

  simulateClose(code = 1000, reason = "", wasClean = true) {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.(new CloseEvent("close", { code, reason, wasClean }));
  }

  simulateError() {
    this.onerror?.(new Event("error"));
  }

  static instances: MockWebSocket[] = [];
  static lastInstance(): MockWebSocket {
    return MockWebSocket.instances[MockWebSocket.instances.length - 1];
  }
}

beforeEach(() => {
  MockWebSocket.instances = [];
  vi.stubGlobal("WebSocket", MockWebSocket);
});

describe("useWebSocket", () => {
  it("given initial state, then status is disconnected and messages are empty", () => {
    const { result } = renderHook(() => useWebSocket());
    expect(result.current.status).toBe("disconnected");
    expect(result.current.messages).toEqual([]);
  });

  it("given connect is called, then status becomes connecting then connected on open", () => {
    const { result } = renderHook(() => useWebSocket());

    act(() => {
      result.current.connect("ws://localhost:8080/ws/echo");
    });
    expect(result.current.status).toBe("connecting");
    expect(MockWebSocket.lastInstance().url).toBe(
      "ws://localhost:8080/ws/echo",
    );

    act(() => {
      MockWebSocket.lastInstance().simulateOpen();
    });
    expect(result.current.status).toBe("connected");
  });

  it("given connect with protocols, then WebSocket is created with protocols", () => {
    const { result } = renderHook(() => useWebSocket());

    act(() => {
      result.current.connect("ws://localhost:8080/ws/echo", ["graphql-ws"]);
    });

    expect(MockWebSocket.lastInstance().protocols).toEqual(["graphql-ws"]);
  });

  it("given a message is received, then it appears in messages as received", () => {
    const { result } = renderHook(() => useWebSocket());

    act(() => {
      result.current.connect("ws://localhost:8080/ws/echo");
      MockWebSocket.lastInstance().simulateOpen();
    });

    act(() => {
      MockWebSocket.lastInstance().simulateMessage("hello from server");
    });

    const received = result.current.messages.filter(
      (m) => m.direction === "received",
    );
    expect(received).toHaveLength(1);
    expect(received[0].content).toBe("hello from server");
    expect(received[0].timestamp).toBeGreaterThan(0);
  });

  it("given send is called while connected, then message is sent and logged", () => {
    const { result } = renderHook(() => useWebSocket());

    act(() => {
      result.current.connect("ws://localhost:8080/ws/echo");
      MockWebSocket.lastInstance().simulateOpen();
    });

    act(() => {
      result.current.send("hello from client");
    });

    expect(MockWebSocket.lastInstance().send).toHaveBeenCalledWith(
      "hello from client",
    );
    const sent = result.current.messages.filter((m) => m.direction === "sent");
    expect(sent).toHaveLength(1);
    expect(sent[0].content).toBe("hello from client");
  });

  it("given send is called while disconnected, then nothing happens", () => {
    const { result } = renderHook(() => useWebSocket());

    act(() => {
      result.current.send("hello");
    });

    expect(result.current.messages).toHaveLength(0);
  });

  it("given disconnect is called, then socket is closed and status returns to disconnected", () => {
    const { result } = renderHook(() => useWebSocket());

    act(() => {
      result.current.connect("ws://localhost:8080/ws/echo");
      MockWebSocket.lastInstance().simulateOpen();
    });
    expect(result.current.status).toBe("connected");

    act(() => {
      result.current.disconnect();
    });
    expect(result.current.status).toBe("disconnected");
    expect(MockWebSocket.lastInstance().close).toHaveBeenCalled();
  });

  it("given a WebSocket error, then status becomes error", () => {
    const { result } = renderHook(() => useWebSocket());

    act(() => {
      result.current.connect("ws://localhost:8080/ws/echo");
      MockWebSocket.lastInstance().simulateOpen();
    });

    act(() => {
      MockWebSocket.lastInstance().simulateError();
    });
    expect(result.current.status).toBe("error");
  });

  it("given clearMessages is called, then messages are emptied", () => {
    const { result } = renderHook(() => useWebSocket());

    act(() => {
      result.current.connect("ws://localhost:8080/ws/echo");
      MockWebSocket.lastInstance().simulateOpen();
    });

    act(() => {
      MockWebSocket.lastInstance().simulateMessage("msg1");
    });
    act(() => {
      result.current.send("msg2");
    });
    expect(result.current.messages.length).toBeGreaterThanOrEqual(2);

    act(() => {
      result.current.clearMessages();
    });
    expect(result.current.messages).toHaveLength(0);
  });

  it("given the hook unmounts, then the socket is closed", () => {
    const { result, unmount } = renderHook(() => useWebSocket());

    act(() => {
      result.current.connect("ws://localhost:8080/ws/echo");
      MockWebSocket.lastInstance().simulateOpen();
    });

    const socket = MockWebSocket.lastInstance();
    unmount();
    expect(socket.close).toHaveBeenCalled();
  });

  it("given connect is called while already connected, then previous socket is closed", () => {
    const { result } = renderHook(() => useWebSocket());

    act(() => {
      result.current.connect("ws://localhost:8080/ws/echo");
      MockWebSocket.lastInstance().simulateOpen();
    });
    const firstSocket = MockWebSocket.lastInstance();

    act(() => {
      result.current.connect("ws://localhost:8080/ws/other");
    });
    expect(firstSocket.close).toHaveBeenCalled();
    expect(MockWebSocket.instances).toHaveLength(2);
  });

  it("given connection opens, then a system message is logged", () => {
    const { result } = renderHook(() => useWebSocket());

    act(() => {
      result.current.connect("ws://localhost:8080/ws/echo");
      MockWebSocket.lastInstance().simulateOpen();
    });

    const system = result.current.messages.filter(
      (m) => m.direction === "system",
    );
    expect(system).toHaveLength(1);
    expect(system[0].content).toContain("Connected to");
  });

  it("given connection closes with code and reason, then a system message includes them", () => {
    const { result } = renderHook(() => useWebSocket());

    act(() => {
      result.current.connect("ws://localhost:8080/ws/auth/bearer");
      MockWebSocket.lastInstance().simulateOpen();
    });

    act(() => {
      MockWebSocket.lastInstance().simulateClose(4401, "Unauthorized");
    });

    const system = result.current.messages.filter(
      (m) => m.direction === "system",
    );
    const closeMsg = system.find((m) => m.content.includes("4401"));
    expect(closeMsg).toBeDefined();
    expect(closeMsg!.content).toContain("Unauthorized");
  });

  it("given connection closes unexpectedly, then system message indicates unexpected close", () => {
    const { result } = renderHook(() => useWebSocket());

    act(() => {
      result.current.connect("ws://localhost:8080/ws/echo");
      MockWebSocket.lastInstance().simulateOpen();
    });

    act(() => {
      MockWebSocket.lastInstance().simulateClose(1006, "", false);
    });

    const system = result.current.messages.filter(
      (m) => m.direction === "system",
    );
    const closeMsg = system.find((m) => m.content.includes("1006"));
    expect(closeMsg).toBeDefined();
    expect(closeMsg!.content).toContain("unexpected close");
  });

  it("given an onConnected callback, when connection opens, then callback is called with the socket", () => {
    const { result } = renderHook(() => useWebSocket());
    const onConnected = vi.fn();

    act(() => {
      result.current.connect("ws://localhost:8080/ws/echo", undefined, onConnected);
      MockWebSocket.lastInstance().simulateOpen();
    });

    expect(onConnected).toHaveBeenCalledTimes(1);
    expect(onConnected).toHaveBeenCalledWith(MockWebSocket.lastInstance());
  });

  it("given a WebSocket error, then a system message is logged", () => {
    const { result } = renderHook(() => useWebSocket());

    act(() => {
      result.current.connect("ws://localhost:8080/ws/echo");
      MockWebSocket.lastInstance().simulateOpen();
    });

    act(() => {
      MockWebSocket.lastInstance().simulateError();
    });

    const system = result.current.messages.filter(
      (m) => m.direction === "system",
    );
    const errorMsg = system.find((m) => m.content.includes("error"));
    expect(errorMsg).toBeDefined();
  });
});
