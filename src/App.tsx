import { useEffect, useState } from "react";
import { AppShell } from "./components/AppShell";
import { exportProjectJson, importProjectJson, loadProject, saveProject } from "./domain/storage";
import type { ModuleId, StudioProject } from "./domain/types";
import { CodexBuildDesk } from "./modules/CodexBuildDesk";
import { DesignGallery } from "./modules/DesignGallery";
import { EvidencePack } from "./modules/EvidencePack";
import { ProductCanvas } from "./modules/ProductCanvas";
import { TestIterate } from "./modules/TestIterate";
import { UISketchLab } from "./modules/UISketchLab";

export default function App() {
  const [activeModule, setActiveModule] = useState<ModuleId>("design-gallery");
  const [project, setProject] = useState<StudioProject>(() => loadProject());

  useEffect(() => {
    saveProject(project);
  }, [project]);

  function handleExport() {
    const json = exportProjectJson(project);
    const safeTitle = (project.title || "waicy-project-studio").replace(/[/:*?"<>|]+/g, "-");

    void navigator.clipboard?.writeText(json);

    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${safeTitle}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport(file: File) {
    try {
      const json = await file.text();
      setProject(importProjectJson(json));
    } catch {
      window.alert("Could not import this JSON file.");
    }
  }

  const moduleView =
    activeModule === "design-gallery" ? (
      <DesignGallery
        project={project}
        onChange={setProject}
        onContinue={() => setActiveModule("product-canvas")}
      />
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
    <AppShell
      activeModule={activeModule}
      project={project}
      onModuleChange={setActiveModule}
      onExport={handleExport}
      onImport={handleImport}
    >
      {moduleView}
    </AppShell>
  );
}
