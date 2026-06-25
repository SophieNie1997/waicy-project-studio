import type { ModuleId } from "../domain/types";

export const modules: Array<{ id: ModuleId; label: string; lesson: string }> = [
  { id: "design-gallery", label: "Design Gallery", lesson: "Lesson 4" },
  { id: "product-canvas", label: "Product Canvas", lesson: "Lesson 4" },
  { id: "ui-sketch-lab", label: "UI Sketch Lab", lesson: "Lesson 5" },
  { id: "codex-build-desk", label: "Codex Build Desk", lesson: "Lesson 5" },
  { id: "test-iterate", label: "Test & Iterate", lesson: "Lesson 6" },
  { id: "evidence-pack", label: "Evidence Pack", lesson: "Lesson 6" },
];

interface ModuleNavProps {
  active: ModuleId;
  onChange: (module: ModuleId) => void;
}

export function ModuleNav({ active, onChange }: ModuleNavProps) {
  return (
    <nav className="module-nav" aria-label="Studio modules">
      <p className="panel-label">Mission Control</p>
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
