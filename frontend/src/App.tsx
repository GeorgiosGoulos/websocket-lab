import { useState, useEffect } from "react";
import type { AuthConfig, Collection, EndpointTab } from "./types";
import { BaseUrlBar } from "./components/BaseUrlBar";
import { EndpointTabs } from "./components/EndpointTabs";
import { EndpointPanel } from "./components/EndpointPanel";
import { CollectionSidebar } from "./components/CollectionSidebar";
import { CollectionActions } from "./components/CollectionActions";
import { saveCollections, loadCollections, saveSidebarState, loadSidebarState } from "./utils/collectionStorage";
import { downloadCollectionFile, readCollectionFile, fileToCollection } from "./utils/collectionFile";

let tabCounter = 1;
let collectionCounter = 1;

function createTab(): EndpointTab {
  const id = `tab-${Date.now()}-${tabCounter}`;
  const label = `Endpoint ${tabCounter}`;
  tabCounter++;
  return { id, label, path: "", auth: { mode: "none" } };
}

function createCollection(): Collection {
  const tab = createTab();
  const id = `col-${Date.now()}-${collectionCounter}`;
  const name = `Collection ${collectionCounter}`;
  collectionCounter++;
  return {
    id,
    name,
    baseUrl: "ws://localhost:8080",
    endpoints: [tab],
    activeTabId: tab.id,
  };
}

function App() {
  const [collections, setCollections] = useState<Collection[]>(() => {
    const stored = loadCollections();
    if (stored) return stored.collections;
    return [createCollection()];
  });
  const [activeCollectionId, setActiveCollectionId] = useState(() => {
    const stored = loadCollections();
    if (stored) return stored.activeId;
    return collections[0].id;
  });
  const [sidebarOpen, setSidebarOpen] = useState(() => loadSidebarState());

  useEffect(() => {
    saveCollections(collections, activeCollectionId);
  }, [collections, activeCollectionId]);

  useEffect(() => {
    saveSidebarState(sidebarOpen);
  }, [sidebarOpen]);

  const activeCollection = collections.find((c) => c.id === activeCollectionId) ?? collections[0];

  const updateCollection = (id: string, updates: Partial<Collection>) => {
    setCollections((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    );
  };

  const setBaseUrl = (baseUrl: string) => {
    updateCollection(activeCollection.id, { baseUrl });
  };

  const addTab = () => {
    const tab = createTab();
    updateCollection(activeCollection.id, {
      endpoints: [...activeCollection.endpoints, tab],
      activeTabId: tab.id,
    });
  };

  const closeTab = (id: string) => {
    const next = activeCollection.endpoints.filter((t) => t.id !== id);
    const updates: Partial<Collection> = { endpoints: next };
    if (activeCollection.activeTabId === id && next.length > 0) {
      updates.activeTabId = next[next.length - 1].id;
    }
    updateCollection(activeCollection.id, updates);
  };

  const updateTab = (id: string, updates: Partial<EndpointTab>) => {
    updateCollection(activeCollection.id, {
      endpoints: activeCollection.endpoints.map((t) =>
        t.id === id ? { ...t, ...updates } : t,
      ),
    });
  };

  const setActiveTabId = (id: string) => {
    updateCollection(activeCollection.id, { activeTabId: id });
  };

  const addCollection = () => {
    const col = createCollection();
    setCollections((prev) => [...prev, col]);
    setActiveCollectionId(col.id);
  };

  const deleteCollection = (id: string) => {
    setCollections((prev) => {
      const next = prev.filter((c) => c.id !== id);
      if (activeCollectionId === id && next.length > 0) {
        setActiveCollectionId(next[next.length - 1].id);
      }
      return next;
    });
  };

  const renameCollection = (id: string, name: string) => {
    updateCollection(id, { name });
  };

  const handleSave = () => {
    downloadCollectionFile(activeCollection);
  };

  const handleImport = async (file: File) => {
    try {
      const collectionFile = await readCollectionFile(file);
      const col = fileToCollection(collectionFile);
      setCollections((prev) => [...prev, col]);
      setActiveCollectionId(col.id);
    } catch (err) {
      console.error("Failed to import collection:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex">
      <CollectionSidebar
        collections={collections}
        activeCollectionId={activeCollectionId}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((prev) => !prev)}
        onSelect={setActiveCollectionId}
        onAdd={addCollection}
        onDelete={deleteCollection}
        onRename={renameCollection}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold">WebSocket Lab</h1>
            <CollectionActions onSave={handleSave} onImport={handleImport} />
          </div>
          <BaseUrlBar value={activeCollection.baseUrl} onChange={setBaseUrl} />
        </header>

        <EndpointTabs
          tabs={activeCollection.endpoints}
          activeTabId={activeCollection.activeTabId}
          onSelect={setActiveTabId}
          onClose={closeTab}
          onAdd={addTab}
        />

        <main className="flex-1 overflow-hidden">
          {activeCollection.endpoints.map((tab) => (
            <EndpointPanel
              key={tab.id}
              visible={tab.id === activeCollection.activeTabId}
              baseUrl={activeCollection.baseUrl}
              path={tab.path}
              onPathChange={(path) => updateTab(tab.id, { path })}
              auth={tab.auth}
              onAuthChange={(auth: AuthConfig) =>
                updateTab(tab.id, { auth })
              }
            />
          ))}
        </main>
      </div>
    </div>
  );
}

export default App;
