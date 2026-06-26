import type { ModuleId } from "../domain/types";

export const modules: Array<{ id: ModuleId; label: string; lesson: string }> = [
  { id: "design-gallery", label: "Find Design Moves", lesson: "Lesson 4" },
  { id: "product-canvas", label: "Product Canvas", lesson: "Lesson 4" },
  { id: "ui-sketch-lab", label: "Draw App Screens", lesson: "Lesson 5" },
  { id: "codex-build-desk", label: "Build with Codex", lesson: "Lesson 5" },
  { id: "test-iterate", label: "Test and Improve", lesson: "Lesson 6" },
  { id: "evidence-pack", label: "Tell the Story", lesson: "Lesson 6" },
];

interface ModuleNavProps {
  active: ModuleId;
  onChange: (module: ModuleId) => void;
}

export function ModuleNav({ active, onChange }: ModuleNavProps) {
  return (
    <nav className="module-nav" aria-label="Studio modules">
      <p className="panel-label">Project Quest</p>
      {modules.map((module) => (
        <button
          key={module.id}
          className={`nav-button ${active === module.id ? "active" : ""}`}
          onClick={() => onChange(module.id)}
          type="button"
        >
          <span>{module.label}</span>
          <small>{module.lesson}</small>
        </button>
      ))}
    </nav>
  );
}
