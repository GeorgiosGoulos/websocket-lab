import { describe, it, expect, vi } from "vitest";
import type { Collection, CollectionFile } from "../types";
import {
  collectionToFile,
  fileToCollection,
  readCollectionFile,
  downloadCollectionFile,
  APP_VERSION,
} from "./collectionFile";

describe("collectionFile", () => {
  describe("collectionToFile (export)", () => {
    it("given a collection, when exported, then output contains metadata, name, baseUrl, and endpoints", () => {
      const collection: Collection = {
        id: "col-1",
        name: "My API",
        baseUrl: "ws://localhost:8080",
        endpoints: [
          { id: "tab-1", label: "Echo", path: "/echo", auth: { mode: "none" } },
        ],
        activeTabId: "tab-1",
      };

      const file = collectionToFile(collection);

      expect(Object.keys(file).sort()).toEqual(["baseUrl", "endpoints", "metadata", "name"]);
      expect(file.name).toBe("My API");
      expect(file.baseUrl).toBe("ws://localhost:8080");
    });

    it("given a collection, when exported, then metadata contains the app version", () => {
      const collection: Collection = {
        id: "col-1",
        name: "Test",
        baseUrl: "ws://localhost",
        endpoints: [{ id: "tab-1", label: "E1", path: "/e1", auth: { mode: "none" } }],
        activeTabId: "tab-1",
      };

      const file = collectionToFile(collection);

      expect(file.metadata).toEqual({ version: APP_VERSION });
      expect(typeof file.metadata.version).toBe("string");
      expect(file.metadata.version.length).toBeGreaterThan(0);
    });

    it("given a collection, when exported, then strips runtime IDs from collection and endpoints", () => {
      const collection: Collection = {
        id: "col-1",
        name: "Test",
        baseUrl: "ws://localhost",
        endpoints: [
          { id: "tab-1", label: "E1", path: "/e1", auth: { mode: "none" } },
          { id: "tab-2", label: "E2", path: "/e2", auth: { mode: "bearer", token: "xyz" } },
        ],
        activeTabId: "tab-1",
      };

      const file = collectionToFile(collection);

      expect(file).not.toHaveProperty("id");
      expect(file).not.toHaveProperty("activeTabId");
      for (const ep of file.endpoints) {
        expect(ep).not.toHaveProperty("id");
      }
    });

    it("given a collection with bearer auth endpoints, when exported, then preserves auth config", () => {
      const collection: Collection = {
        id: "col-1",
        name: "Auth API",
        baseUrl: "ws://localhost",
        endpoints: [
          { id: "tab-1", label: "Secure", path: "/secure", auth: { mode: "bearer", token: "secret-123" } },
        ],
        activeTabId: "tab-1",
      };

      const file = collectionToFile(collection);

      expect(file.endpoints[0].auth).toEqual({ mode: "bearer", token: "secret-123" });
    });

    it("given a collection with multiple endpoints, when exported, then preserves endpoint order and count", () => {
      const collection: Collection = {
        id: "col-1",
        name: "Multi",
        baseUrl: "ws://localhost",
        endpoints: [
          { id: "tab-1", label: "First", path: "/first", auth: { mode: "none" } },
          { id: "tab-2", label: "Second", path: "/second", auth: { mode: "none" } },
          { id: "tab-3", label: "Third", path: "/third", auth: { mode: "none" } },
        ],
        activeTabId: "tab-2",
      };

      const file = collectionToFile(collection);

      expect(file.endpoints).toHaveLength(3);
      expect(file.endpoints.map((e) => e.label)).toEqual(["First", "Second", "Third"]);
    });
  });

  describe("fileToCollection (import)", () => {
    it("given a file with endpoints, when imported, then sets activeTabId to first endpoint", () => {
      const file: CollectionFile = {
        metadata: { version: "0.0.1" },
        name: "Test",
        baseUrl: "ws://localhost",
        endpoints: [
          { label: "A", path: "/a", auth: { mode: "none" } },
          { label: "B", path: "/b", auth: { mode: "none" } },
        ],
      };

      const collection = fileToCollection(file);

      expect(collection.activeTabId).toBe(collection.endpoints[0].id);
    });

    it("given empty endpoints array, when imported, then creates a default endpoint", () => {
      const file: CollectionFile = {
        metadata: { version: "0.0.1" },
        name: "Empty",
        baseUrl: "ws://localhost",
        endpoints: [],
      };

      const collection = fileToCollection(file);

      expect(collection.endpoints).toHaveLength(1);
      expect(collection.endpoints[0].label).toBe("Endpoint 1");
      expect(collection.endpoints[0].path).toBe("");
      expect(collection.endpoints[0].auth).toEqual({ mode: "none" });
      expect(collection.activeTabId).toBe(collection.endpoints[0].id);
    });

    it("given a file, when imported, then generates unique runtime IDs across calls", () => {
      const file: CollectionFile = {
        metadata: { version: "0.0.1" },
        name: "Test",
        baseUrl: "ws://localhost",
        endpoints: [{ label: "E1", path: "/e1", auth: { mode: "none" } }],
      };

      const c1 = fileToCollection(file);
      const c2 = fileToCollection(file);

      expect(c1.id).not.toBe(c2.id);
      expect(c1.endpoints[0].id).not.toBe(c2.endpoints[0].id);
    });

    it("given a file, when imported, then each endpoint gets a distinct ID", () => {
      const file: CollectionFile = {
        metadata: { version: "0.0.1" },
        name: "Test",
        baseUrl: "ws://localhost",
        endpoints: [
          { label: "A", path: "/a", auth: { mode: "none" } },
          { label: "B", path: "/b", auth: { mode: "none" } },
        ],
      };

      const collection = fileToCollection(file);
      const ids = collection.endpoints.map((e) => e.id);

      expect(new Set(ids).size).toBe(ids.length);
    });

    it("given a file with bearer auth, when imported, then preserves auth config", () => {
      const file: CollectionFile = {
        metadata: { version: "0.0.1" },
        name: "Auth",
        baseUrl: "ws://localhost",
        endpoints: [
          { label: "Secure", path: "/secure", auth: { mode: "bearer", token: "my-token" } },
        ],
      };

      const collection = fileToCollection(file);

      expect(collection.endpoints[0].auth).toEqual({ mode: "bearer", token: "my-token" });
    });
  });

  describe("round-trip (export then import)", () => {
    it("given a collection, when exported and re-imported, then preserves all endpoint data", () => {
      const original: Collection = {
        id: "col-1",
        name: "My API",
        baseUrl: "ws://localhost:8080",
        endpoints: [
          { id: "tab-1", label: "Echo", path: "/echo", auth: { mode: "none" } },
          { id: "tab-2", label: "Auth", path: "/auth", auth: { mode: "bearer", token: "abc" } },
        ],
        activeTabId: "tab-1",
      };

      const file = collectionToFile(original);
      const restored = fileToCollection(file);

      expect(restored.name).toBe("My API");
      expect(restored.baseUrl).toBe("ws://localhost:8080");
      expect(restored.endpoints).toHaveLength(2);
      expect(restored.endpoints[0].label).toBe("Echo");
      expect(restored.endpoints[0].path).toBe("/echo");
      expect(restored.endpoints[0].auth).toEqual({ mode: "none" });
      expect(restored.endpoints[1].label).toBe("Auth");
      expect(restored.endpoints[1].path).toBe("/auth");
      expect(restored.endpoints[1].auth).toEqual({ mode: "bearer", token: "abc" });
    });

    it("given a collection, when exported to JSON and re-imported via readCollectionFile, then survives serialization", async () => {
      const original: Collection = {
        id: "col-1",
        name: "Serialized API",
        baseUrl: "wss://example.com",
        endpoints: [
          { id: "tab-1", label: "Stream", path: "/stream", auth: { mode: "none" } },
          { id: "tab-2", label: "Private", path: "/private", auth: { mode: "bearer", token: "tok-456" } },
        ],
        activeTabId: "tab-1",
      };

      const exported = collectionToFile(original);
      const json = JSON.stringify(exported);
      const blob = new File([json], "test.json", { type: "application/json" });
      const parsed = await readCollectionFile(blob);
      const restored = fileToCollection(parsed);

      expect(restored.name).toBe("Serialized API");
      expect(restored.baseUrl).toBe("wss://example.com");
      expect(restored.endpoints).toHaveLength(2);
      expect(restored.endpoints[0].label).toBe("Stream");
      expect(restored.endpoints[0].path).toBe("/stream");
      expect(restored.endpoints[1].label).toBe("Private");
      expect(restored.endpoints[1].auth).toEqual({ mode: "bearer", token: "tok-456" });
    });

    it("given a collection, when exported to JSON and re-imported, then metadata round-trips correctly", async () => {
      const original: Collection = {
        id: "col-1",
        name: "Meta Test",
        baseUrl: "ws://localhost",
        endpoints: [{ id: "tab-1", label: "E1", path: "/e1", auth: { mode: "none" } }],
        activeTabId: "tab-1",
      };

      const exported = collectionToFile(original);
      const json = JSON.stringify(exported);
      const blob = new File([json], "test.json", { type: "application/json" });
      const parsed = await readCollectionFile(blob);

      expect(parsed.metadata).toEqual({ version: "0.0.1" });
    });
  });

  describe("readCollectionFile (validation)", () => {
    it("given invalid JSON, when read, then rejects with error", async () => {
      const file = new File(["not json {{{"], "bad.json", { type: "application/json" });

      await expect(readCollectionFile(file)).rejects.toThrow("Invalid JSON file");
    });

    it("given an empty string, when read, then rejects with error", async () => {
      const file = new File([""], "empty.json", { type: "application/json" });

      await expect(readCollectionFile(file)).rejects.toThrow("Invalid JSON file");
    });

    it("given JSON that is an array instead of object, when read, then rejects", async () => {
      const file = new File([JSON.stringify([1, 2, 3])], "array.json", { type: "application/json" });

      await expect(readCollectionFile(file)).rejects.toThrow("missing required fields");
    });

    it("given JSON that is null, when read, then rejects", async () => {
      const file = new File(["null"], "null.json", { type: "application/json" });

      await expect(readCollectionFile(file)).rejects.toThrow("missing required fields");
    });

    it("given JSON missing metadata field, when read, then rejects", async () => {
      const file = new File(
        [JSON.stringify({ name: "Test", baseUrl: "ws://localhost", endpoints: [] })],
        "no-meta.json",
        { type: "application/json" },
      );

      await expect(readCollectionFile(file)).rejects.toThrow("missing required fields");
    });

    it("given JSON with metadata missing version, when read, then rejects", async () => {
      const file = new File(
        [JSON.stringify({ metadata: {}, name: "Test", baseUrl: "ws://localhost", endpoints: [] })],
        "no-version.json",
        { type: "application/json" },
      );

      await expect(readCollectionFile(file)).rejects.toThrow("missing required fields");
    });

    it("given JSON with metadata as non-object, when read, then rejects", async () => {
      const file = new File(
        [JSON.stringify({ metadata: "not-object", name: "Test", baseUrl: "ws://localhost", endpoints: [] })],
        "bad-meta.json",
        { type: "application/json" },
      );

      await expect(readCollectionFile(file)).rejects.toThrow("missing required fields");
    });

    it("given JSON missing name field, when read, then rejects", async () => {
      const file = new File(
        [JSON.stringify({ metadata: { version: "0.0.1" }, baseUrl: "ws://localhost", endpoints: [] })],
        "no-name.json",
        { type: "application/json" },
      );

      await expect(readCollectionFile(file)).rejects.toThrow("missing required fields");
    });

    it("given JSON missing baseUrl field, when read, then rejects", async () => {
      const file = new File(
        [JSON.stringify({ metadata: { version: "0.0.1" }, name: "Test", endpoints: [] })],
        "no-url.json",
        { type: "application/json" },
      );

      await expect(readCollectionFile(file)).rejects.toThrow("missing required fields");
    });

    it("given JSON missing endpoints field, when read, then rejects", async () => {
      const file = new File(
        [JSON.stringify({ metadata: { version: "0.0.1" }, name: "Test", baseUrl: "ws://localhost" })],
        "no-endpoints.json",
        { type: "application/json" },
      );

      await expect(readCollectionFile(file)).rejects.toThrow("missing required fields");
    });

    it("given JSON with non-string name, when read, then rejects", async () => {
      const file = new File(
        [JSON.stringify({ metadata: { version: "0.0.1" }, name: 123, baseUrl: "ws://localhost", endpoints: [] })],
        "bad-name.json",
        { type: "application/json" },
      );

      await expect(readCollectionFile(file)).rejects.toThrow("missing required fields");
    });

    it("given JSON with non-array endpoints, when read, then rejects", async () => {
      const file = new File(
        [JSON.stringify({ metadata: { version: "0.0.1" }, name: "Test", baseUrl: "ws://localhost", endpoints: "not-array" })],
        "bad-endpoints.json",
        { type: "application/json" },
      );

      await expect(readCollectionFile(file)).rejects.toThrow("missing required fields");
    });

    it("given valid collection JSON, when read, then returns CollectionFile", async () => {
      const data: CollectionFile = {
        metadata: { version: "0.0.1" },
        name: "Test",
        baseUrl: "ws://localhost",
        endpoints: [{ label: "E1", path: "/e1", auth: { mode: "none" } }],
      };
      const file = new File([JSON.stringify(data)], "test.json", { type: "application/json" });

      const result = await readCollectionFile(file);

      expect(result).toEqual(data);
    });

    it("given valid JSON with extra fields, when read, then still accepts it", async () => {
      const data = {
        metadata: { version: "0.0.1" },
        name: "Test",
        baseUrl: "ws://localhost",
        endpoints: [],
        extraField: "should be ignored",
      };
      const file = new File([JSON.stringify(data)], "extra.json", { type: "application/json" });

      const result = await readCollectionFile(file);

      expect(result.name).toBe("Test");
      expect(result.baseUrl).toBe("ws://localhost");
      expect(result.endpoints).toEqual([]);
    });
  });

  describe("downloadCollectionFile", () => {
    it("given a collection, when downloaded, then creates a link with correct JSON content and filename", () => {
      const clickSpy = vi.fn();
      const fakeAnchor = { href: "", download: "", click: clickSpy };
      vi.spyOn(document, "createElement").mockReturnValue(fakeAnchor as unknown as HTMLAnchorElement);
      const createObjectURLSpy = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock-url");
      const revokeObjectURLSpy = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

      const collection: Collection = {
        id: "col-1",
        name: "My API",
        baseUrl: "ws://localhost:8080",
        endpoints: [
          { id: "tab-1", label: "Echo", path: "/echo", auth: { mode: "none" } },
        ],
        activeTabId: "tab-1",
      };

      downloadCollectionFile(collection);

      expect(clickSpy).toHaveBeenCalledOnce();
      expect(createObjectURLSpy).toHaveBeenCalledWith(expect.any(Blob));
      expect(revokeObjectURLSpy).toHaveBeenCalledWith("blob:mock-url");

      const blob = createObjectURLSpy.mock.calls[0][0] as Blob;
      expect(blob.type).toBe("application/json");

      createObjectURLSpy.mockRestore();
      revokeObjectURLSpy.mockRestore();
      vi.restoreAllMocks();
    });
  });
});
