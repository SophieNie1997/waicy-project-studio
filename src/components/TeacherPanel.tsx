import { type ChangeEvent, useState } from "react";
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
  const readiness = Object.values(getProjectReadiness(project));
  const unlocked = canUnlockCodex(project);

  function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) onImport(file);
    event.target.value = "";
  }

  return (
    <aside className={`teacher-panel ${open ? "teacher-panel-open" : "teacher-panel-collapsed"}`}>
      <div className="teacher-panel-header">
        <p className="panel-label">Teacher mode</p>
        <button className="teacher-toggle" onClick={() => setOpen((value) => !value)} type="button">
          {open ? "Hide teacher tools" : "Show teacher tools"}
        </button>
      </div>
      <section className="panel-card">
        <h2>Codex status</h2>
        <StatusPill ready={unlocked} label={unlocked ? "Unlocked" : "Locked"} />
        <p>{unlocked ? "Student design is ready for teacher handoff." : "Complete the canvas and paper sketch decisions first."}</p>
      </section>
      {open ? (
        <>
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
          <label className="secondary-button file-button">
            Import JSON
            <input accept="application/json,.json" onChange={handleImport} type="file" />
          </label>
        </>
      ) : null}
    </aside>
  );
}
