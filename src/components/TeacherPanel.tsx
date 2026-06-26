import { type ChangeEvent, useRef, useState } from "react";
import { canUnlockCodex, getProjectReadiness } from "../domain/readiness";
import type { StudioProject } from "../domain/types";
import { StatusPill } from "./StatusPill";

interface TeacherPanelProps {
  project: StudioProject;
  onExport: () => void;
  onImport: (file: File) => void;
}

export function TeacherPanel({ project, onExport, onImport }: TeacherPanelProps) {
  const [open, setOpen] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);
  const readiness = Object.values(getProjectReadiness(project));
  const unlocked = canUnlockCodex(project);

  function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) onImport(file);
    event.target.value = "";
  }

  return (
    <aside
      aria-label="Teacher mode"
      className={`teacher-panel teacher-panel-floating ${open ? "teacher-panel-open" : "teacher-panel-collapsed"}`}
    >
      {open ? (
        <>
          <div className="teacher-panel-header">
            <p className="panel-label">Teacher mode</p>
            <button
              aria-expanded="true"
              className="teacher-toggle"
              onClick={() => setOpen(false)}
              type="button"
            >
              Hide teacher tools
            </button>
          </div>
          <section className="panel-card">
            <h2>Codex status</h2>
            <StatusPill ready={unlocked} label={unlocked ? "Unlocked" : "Locked"} />
            <p>
              {unlocked
                ? "Student design is ready for teacher handoff."
                : "Complete the canvas and paper sketch decisions first."}
            </p>
          </section>
          <section className="panel-card">
            <h2>Readiness</h2>
            <div className="readiness-list">
              {readiness.map((item) => (
                <div key={item.label} className="readiness-row">
                  <span>{item.label}</span>
                  <StatusPill ready={item.ready} label={item.ready ? "Ready" : "Needs work"} />
                </div>
              ))}
            </div>
          </section>
          <section className="panel-card">
            <h2>Collected moves</h2>
            {project.borrowedPrinciples.length > 0 ? (
              <ul className="panel-list">
                {project.borrowedPrinciples.map((principle) => (
                  <li key={principle}>{principle}</li>
                ))}
              </ul>
            ) : (
              <p>No design moves collected yet.</p>
            )}
          </section>
          <button className="secondary-button" onClick={onExport} type="button">
            Export JSON
          </button>
          <button className="secondary-button file-button" onClick={() => importInputRef.current?.click()} type="button">
            Import JSON
          </button>
          <input
            ref={importInputRef}
            accept="application/json,.json"
            className="file-input"
            onChange={handleImport}
            type="file"
          />
        </>
      ) : (
        <button
          aria-expanded="false"
          aria-label="Show teacher tools"
          className="teacher-tab"
          onClick={() => setOpen(true)}
          type="button"
        >
          <span>Teacher mode</span>
          <small>{unlocked ? "Ready" : "Locked"}</small>
        </button>
      )}
    </aside>
  );
}
