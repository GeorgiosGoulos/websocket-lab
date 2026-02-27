import type { EndpointTab } from "../types";

interface EndpointTabsProps {
  tabs: EndpointTab[];
  activeTabId: string;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
  onAdd: () => void;
}

export function EndpointTabs({
  tabs,
  activeTabId,
  onSelect,
  onClose,
  onAdd,
}: EndpointTabsProps) {
  return (
    <div className="flex items-center gap-1 border-b border-gray-700 overflow-x-auto">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`flex items-center gap-1 px-3 py-2 text-sm cursor-pointer border-b-2 whitespace-nowrap ${
            tab.id === activeTabId
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
          onClick={() => onSelect(tab.id)}
        >
          <span>{tab.label}</span>
          {tabs.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose(tab.id);
              }}
              className="ml-1 text-gray-500 hover:text-gray-300"
              aria-label={`Close ${tab.label}`}
            >
              ×
            </button>
          )}
        </div>
      ))}
      <button
        onClick={onAdd}
        className="px-3 py-2 text-gray-500 hover:text-gray-300 text-lg"
        aria-label="Add tab"
      >
        +
      </button>
    </div>
  );
}
