import { canUnlockCodex, getProjectReadiness } from "../domain/readiness";
import type { StudioProject } from "../domain/types";
import { StatusPill } from "./StatusPill";

interface TeacherPanelProps {
  project: StudioProject;
  onExport: () => void;
}

export function TeacherPanel({ project, onExport }: TeacherPanelProps) {
  const readiness = Object.values(getProjectReadiness(project));
  const unlocked = canUnlockCodex(project);

  return (
    <aside className="teacher-panel">
      <p className="panel-label">Teacher Controls</p>
      <section className="panel-card">
        <h2>Codex status</h2>
        <StatusPill ready={unlocked} label={unlocked ? "Unlocked" : "Locked"} />
        <p>{unlocked ? "Student design is ready for teacher handoff." : "Complete the canvas and paper sketch decisions first."}</p>
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
      <button className="secondary-button" onClick={onExport} type="button">
        Export JSON
      </button>
    </aside>
  );
}
