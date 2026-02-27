import { useState } from "react";
import type { AuthConfig as AuthConfigType, AuthMode } from "../types";

interface AuthConfigProps {
  auth: AuthConfigType;
  onChange: (auth: AuthConfigType) => void;
  disabled: boolean;
}

export function AuthConfig({ auth, onChange, disabled }: AuthConfigProps) {
  const [open, setOpen] = useState(false);

  const handleModeChange = (mode: AuthMode) => {
    if (mode === "none") onChange({ mode: "none" });
    else onChange({ mode: "bearer", token: "" });
  };

  return (
    <div className="border border-gray-700 rounded">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-300 hover:text-gray-100"
      >
        <span>Authentication ({auth.mode})</span>
        <span className="text-xs">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="px-3 pb-3 flex flex-col gap-2">
          <select
            value={auth.mode}
            onChange={(e) => handleModeChange(e.target.value as AuthMode)}
            disabled={disabled}
            className="bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
            aria-label="Auth mode"
          >
            <option value="none">None</option>
            <option value="bearer">Bearer token</option>
          </select>

          {auth.mode === "bearer" && (
            <>
              <input
                type="text"
                value={auth.token}
                onChange={(e) => onChange({ ...auth, token: e.target.value })}
                placeholder="Bearer token"
                disabled={disabled}
                aria-label="Bearer token"
                className="bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
              <p className="text-xs text-gray-500">
                The browser WebSocket API does not support custom HTTP headers,
                so an <code className="text-gray-400">Authorization</code> header
                cannot be sent with the handshake. Instead, the token is appended
                as a <code className="text-gray-400">?token=</code> query parameter
                and sent as a first-message auth
                payload (<code className="text-gray-400">{`{"type":"auth","token":"..."}`}</code>)
                on connect.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
