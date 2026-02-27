import { describe, it, expect } from "vitest";
import { buildWebSocketUrl } from "./buildWebSocketUrl";
import type { AuthConfig } from "../types";

describe("buildWebSocketUrl", () => {
  const base = "ws://localhost:8080";

  describe("auth mode: none", () => {
    const auth: AuthConfig = { mode: "none" };

    it("given base and path, then returns combined URL", () => {
      expect(buildWebSocketUrl(base, "/ws/echo", auth)).toBe(
        "ws://localhost:8080/ws/echo",
      );
    });

    it("given path without leading slash, then normalizes it", () => {
      expect(buildWebSocketUrl(base, "ws/echo", auth)).toBe(
        "ws://localhost:8080/ws/echo",
      );
    });

    it("given base with trailing slash, then strips it", () => {
      expect(buildWebSocketUrl("ws://localhost:8080/", "/ws/echo", auth)).toBe(
        "ws://localhost:8080/ws/echo",
      );
    });

    it("given base with multiple trailing slashes, then strips all", () => {
      expect(
        buildWebSocketUrl("ws://localhost:8080///", "/ws/echo", auth),
      ).toBe("ws://localhost:8080/ws/echo");
    });
  });

  describe("auth mode: bearer", () => {
    it("given a token, then appends as query param", () => {
      const auth: AuthConfig = { mode: "bearer", token: "abc123" };
      expect(buildWebSocketUrl(base, "/ws/echo", auth)).toBe(
        "ws://localhost:8080/ws/echo?token=abc123",
      );
    });

    it("given path with existing query params, then appends with &", () => {
      const auth: AuthConfig = { mode: "bearer", token: "abc123" };
      expect(buildWebSocketUrl(base, "/ws/echo?foo=bar", auth)).toBe(
        "ws://localhost:8080/ws/echo?foo=bar&token=abc123",
      );
    });

    it("given special characters in token, then encodes them", () => {
      const auth: AuthConfig = { mode: "bearer", token: "abc+def/ghi=" };
      expect(buildWebSocketUrl(base, "/ws/echo", auth)).toBe(
        "ws://localhost:8080/ws/echo?token=abc%2Bdef%2Fghi%3D",
      );
    });
  });
});
