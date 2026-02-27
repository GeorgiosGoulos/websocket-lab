interface BaseUrlBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function BaseUrlBar({ value, onChange }: BaseUrlBarProps) {
  return (
    <div className="flex items-center gap-3">
      <label htmlFor="base-url" className="text-sm font-medium text-gray-400 whitespace-nowrap">
        Base URL
      </label>
      <input
        id="base-url"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="ws://localhost:8080"
        className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
      />
    </div>
  );
}
