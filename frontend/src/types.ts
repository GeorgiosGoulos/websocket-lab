export type AuthMode = "none" | "bearer";

export type AuthConfig =
  | { mode: "none" }
  | { mode: "bearer"; token: string };

export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

export interface LogMessage {
  id: string;
  direction: "sent" | "received" | "system";
  content: string;
  timestamp: number;
}

export interface EndpointTab {
  id: string;
  label: string;
  path: string;
  auth: AuthConfig;
}

export interface EndpointConfig {
  label: string;
  path: string;
  auth: AuthConfig;
}

export interface Collection {
  id: string;
  name: string;
  baseUrl: string;
  endpoints: EndpointTab[];
  activeTabId: string;
}

export interface CollectionFileMetadata {
  version: string;
}

export interface CollectionFile {
  metadata: CollectionFileMetadata;
  name: string;
  baseUrl: string;
  endpoints: EndpointConfig[];
}
