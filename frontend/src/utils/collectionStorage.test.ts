import { describe, it, expect, beforeEach } from "vitest";
import type { Collection } from "../types";
import {
  saveCollections,
  loadCollections,
  saveSidebarState,
  loadSidebarState,
} from "./collectionStorage";

const mockCollection: Collection = {
  id: "col-1",
  name: "Test",
  baseUrl: "ws://localhost:8080",
  endpoints: [{ id: "tab-1", label: "E1", path: "/echo", auth: { mode: "none" } }],
  activeTabId: "tab-1",
};

describe("collectionStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("saveCollections / loadCollections", () => {
    it("given collections are saved, when loaded, then returns the same data", () => {
      saveCollections([mockCollection], "col-1");

      const result = loadCollections();

      expect(result).not.toBeNull();
      expect(result!.collections).toEqual([mockCollection]);
      expect(result!.activeId).toBe("col-1");
    });

    it("given nothing is stored, when loaded, then returns null", () => {
      expect(loadCollections()).toBeNull();
    });

    it("given corrupt JSON in storage, when loaded, then returns null", () => {
      localStorage.setItem("wslab-collections", "not-json");

      expect(loadCollections()).toBeNull();
    });

    it("given empty collections array in storage, when loaded, then returns null", () => {
      localStorage.setItem(
        "wslab-collections",
        JSON.stringify({ collections: [], activeId: "" }),
      );

      expect(loadCollections()).toBeNull();
    });
  });

  describe("saveSidebarState / loadSidebarState", () => {
    it("given sidebar state is saved as false, when loaded, then returns false", () => {
      saveSidebarState(false);
      expect(loadSidebarState()).toBe(false);
    });

    it("given sidebar state is saved as true, when loaded, then returns true", () => {
      saveSidebarState(true);
      expect(loadSidebarState()).toBe(true);
    });

    it("given no sidebar state stored, when loaded, then defaults to true", () => {
      expect(loadSidebarState()).toBe(true);
    });
  });
});
