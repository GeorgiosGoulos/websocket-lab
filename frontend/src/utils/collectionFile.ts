import type { Collection, CollectionFile, EndpointTab } from "../types";

export const APP_VERSION: string = __APP_VERSION__;

let idCounter = 0;

function generateId(): string {
  return `tab-${Date.now()}-${++idCounter}`;
}

export function collectionToFile(collection: Collection): CollectionFile {
  return {
    metadata: { version: APP_VERSION },
    name: collection.name,
    baseUrl: collection.baseUrl,
    endpoints: collection.endpoints.map(({ label, path, auth }) => ({
      label,
      path,
      auth,
    })),
  };
}

export function fileToCollection(file: CollectionFile): Collection {
  const endpoints: EndpointTab[] =
    file.endpoints.length > 0
      ? file.endpoints.map((ep) => ({ id: generateId(), ...ep }))
      : [{ id: generateId(), label: "Endpoint 1", path: "", auth: { mode: "none" } }];

  return {
    id: `col-${Date.now()}-${++idCounter}`,
    name: file.name,
    baseUrl: file.baseUrl,
    endpoints,
    activeTabId: endpoints[0].id,
  };
}

export function downloadCollectionFile(collection: Collection): void {
  const file = collectionToFile(collection);
  const json = JSON.stringify(file, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${collection.name}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function readCollectionFile(file: File): Promise<CollectionFile> {
  const text = await file.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Invalid JSON file");
  }

  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("Invalid collection file: missing required fields");
  }

  const obj = parsed as Record<string, unknown>;
  const meta = typeof obj.metadata === "object" && obj.metadata !== null
    ? (obj.metadata as Record<string, unknown>)
    : undefined;

  if (
    !meta ||
    typeof meta.version !== "string" ||
    typeof obj.name !== "string" ||
    typeof obj.baseUrl !== "string" ||
    !Array.isArray(obj.endpoints)
  ) {
    throw new Error("Invalid collection file: missing required fields");
  }

  return parsed as CollectionFile;
}
