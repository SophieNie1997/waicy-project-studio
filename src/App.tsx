import { useState } from "react";
import { AppShell } from "./components/AppShell";
import { createInitialProject } from "./domain/initialProject";
import { exportProjectJson } from "./domain/storage";
import type { ModuleId, StudioProject } from "./domain/types";
import { DesignGallery } from "./modules/DesignGallery";
import { ProductCanvas } from "./modules/ProductCanvas";

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
  const [project, setProject] = useState<StudioProject>(() => createInitialProject());

  function handleExport() {
    void navigator.clipboard?.writeText(exportProjectJson(project));
  }

  const moduleView =
    activeModule === "design-gallery" ? (
      <DesignGallery project={project} onChange={setProject} />
    ) : activeModule === "product-canvas" ? (
      <ProductCanvas project={project} onChange={setProject} />
    ) : (
      <PlaceholderModule
        title={{
          "ui-sketch-lab": "UI Sketch Lab",
          "codex-build-desk": "Codex Build Desk",
          "test-iterate": "Test & Iterate",
          "evidence-pack": "Evidence Pack",
        }[activeModule]}
      />
    );

  return (
    <AppShell activeModule={activeModule} project={project} onModuleChange={setActiveModule} onExport={handleExport}>
      {moduleView}
    </AppShell>
  );
}
