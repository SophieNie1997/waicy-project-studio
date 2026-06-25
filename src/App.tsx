import { useMemo, useState } from "react";
import { AppShell } from "./components/AppShell";
import { createInitialProject } from "./domain/initialProject";
import { exportProjectJson } from "./domain/storage";
import type { ModuleId, StudioProject } from "./domain/types";

function PlaceholderModule({ title }: { title: string }) {
  return (
    <section className="module-panel">
      <p className="eyebrow">WAICY Project Studio</p>
      <h1>{title}</h1>
      <p className="lede">This module will guide students through a focused project-design activity.</p>
    </section>
  );
}

export default function App() {
  const [activeModule, setActiveModule] = useState<ModuleId>("design-gallery");
  const [project] = useState<StudioProject>(() => createInitialProject());

  const activeTitle = useMemo(() => {
    const titles: Record<ModuleId, string> = {
      "design-gallery": "Design Gallery",
      "product-canvas": "Product Canvas",
      "ui-sketch-lab": "UI Sketch Lab",
      "codex-build-desk": "Codex Build Desk",
      "test-iterate": "Test & Iterate",
      "evidence-pack": "Evidence Pack",
    };
    return titles[activeModule];
  }, [activeModule]);

  function handleExport() {
    void navigator.clipboard?.writeText(exportProjectJson(project));
  }

  return (
    <AppShell activeModule={activeModule} project={project} onModuleChange={setActiveModule} onExport={handleExport}>
      <PlaceholderModule title={activeTitle} />
    </AppShell>
  );
}
