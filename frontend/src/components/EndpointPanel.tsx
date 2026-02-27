import type { AuthConfig } from "../types";
import { useWebSocket } from "../hooks/useWebSocket";
import { buildWebSocketUrl } from "../utils/buildWebSocketUrl";
import { ConnectionConfig } from "./ConnectionConfig";
import { AuthConfig as AuthConfigComponent } from "./AuthConfig";
import { MessageComposer } from "./MessageComposer";
import { MessageLog } from "./MessageLog";

interface EndpointPanelProps {
  path: string;
  onPathChange: (path: string) => void;
  auth: AuthConfig;
  onAuthChange: (auth: AuthConfig) => void;
  baseUrl: string;
  visible: boolean;
}

export function EndpointPanel({
  path,
  onPathChange,
  auth,
  onAuthChange,
  baseUrl,
  visible,
}: EndpointPanelProps) {
  const { status, messages, connect, disconnect, send, clearMessages } =
    useWebSocket();

  const trimmedBase = baseUrl.trim();
  const trimmedPath = path.trim();
  const fullUrl = trimmedPath ? buildWebSocketUrl(trimmedBase, trimmedPath, auth) : "";

  const handleConnect = () => {
    if (!fullUrl) return;

    if (auth.mode === "bearer") {
      connect(fullUrl, undefined, (ws) => {
        ws.send(JSON.stringify({ type: "auth", token: auth.token }));
      });
    } else {
      connect(fullUrl);
    }
  };

  const isConnected = status === "connected" || status === "connecting";

  return (
    <div className={`h-full flex flex-col ${visible ? "" : "hidden"}`}>
      <div className="p-4 flex flex-col gap-3 border-b border-gray-800">
        <ConnectionConfig
          path={path}
          onPathChange={onPathChange}
          fullUrl={fullUrl}
          status={status}
          onConnect={handleConnect}
          onDisconnect={disconnect}
        />
        <AuthConfigComponent
          auth={auth}
          onChange={onAuthChange}
          disabled={isConnected}
        />
      </div>

      <div className="flex-1 flex flex-col min-h-0 p-4 gap-3">
        <MessageLog messages={messages} onClear={clearMessages} />
        <MessageComposer
          onSend={send}
          disabled={status !== "connected"}
        />
      </div>
    </div>
  );
}
