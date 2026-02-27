import type { AuthConfig } from "../types";

export function buildWebSocketUrl(
  baseUrl: string,
  path: string,
  auth: AuthConfig,
): string {
  const trimmedBase = baseUrl.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (auth.mode === "bearer") {
    const separator = normalizedPath.includes("?") ? "&" : "?";
    return `${trimmedBase}${normalizedPath}${separator}token=${encodeURIComponent(auth.token)}`;
  }

  return `${trimmedBase}${normalizedPath}`;
}
