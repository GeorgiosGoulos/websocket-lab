import type { ConnectionStatus } from "../types";

interface ConnectionConfigProps {
  path: string;
  onPathChange: (path: string) => void;
  fullUrl: string;
  status: ConnectionStatus;
  onConnect: () => void;
  onDisconnect: () => void;
}

const statusColors: Record<ConnectionStatus, string> = {
  disconnected: "bg-gray-500",
  connecting: "bg-yellow-500",
  connected: "bg-green-500",
  error: "bg-red-500",
};

export function ConnectionConfig({
  path,
  onPathChange,
  fullUrl,
  status,
  onConnect,
  onDisconnect,
}: ConnectionConfigProps) {
  const isConnected = status === "connected";
  const isConnecting = status === "connecting";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={path}
          onChange={(e) => onPathChange(e.target.value)}
          placeholder="/ws/echo"
          aria-label="Endpoint path"
          className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
          disabled={isConnected || isConnecting}
        />
        <button
          onClick={isConnected ? onDisconnect : onConnect}
          disabled={isConnecting}
          className={`px-4 py-2 rounded text-sm font-medium ${
            isConnected
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          } disabled:opacity-50`}
        >
          {isConnected ? "Disconnect" : "Connect"}
        </button>
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${statusColors[status]}`}
            aria-label={`Status: ${status}`}
          />
          <span className="text-xs text-gray-400 capitalize">{status}</span>
        </div>
      </div>
      <p className="text-xs text-gray-500 font-mono truncate" title={fullUrl}>
        {fullUrl || "Configure path to see full URL"}
      </p>
    </div>
  );
}
