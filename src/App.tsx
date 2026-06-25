import { useState } from "react";
import { AppShell } from "./components/AppShell";
import { createInitialProject } from "./domain/initialProject";
import { exportProjectJson } from "./domain/storage";
import type { ModuleId, StudioProject } from "./domain/types";
import { CodexBuildDesk } from "./modules/CodexBuildDesk";
import { DesignGallery } from "./modules/DesignGallery";
import { EvidencePack } from "./modules/EvidencePack";
import { ProductCanvas } from "./modules/ProductCanvas";
import { TestIterate } from "./modules/TestIterate";
import { UISketchLab } from "./modules/UISketchLab";

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
    ) : activeModule === "ui-sketch-lab" ? (
      <UISketchLab project={project} onChange={setProject} />
    ) : activeModule === "codex-build-desk" ? (
      <CodexBuildDesk project={project} />
    ) : activeModule === "test-iterate" ? (
      <TestIterate project={project} onChange={setProject} />
    ) : (
      <EvidencePack project={project} />
    );

  return (
    <AppShell activeModule={activeModule} project={project} onModuleChange={setActiveModule} onExport={handleExport}>
      {moduleView}
    </AppShell>
  );
}
