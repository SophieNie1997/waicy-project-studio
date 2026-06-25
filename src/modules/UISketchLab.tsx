import { Field } from "../components/Field";
import type { StudioProject, StudioScreen } from "../domain/types";

interface UISketchLabProps {
  project: StudioProject;
  onChange: (project: StudioProject) => void;
}

export function UISketchLab({ project, onChange }: UISketchLabProps) {
  function updateScreen(id: StudioScreen["id"], patch: Partial<StudioScreen>) {
    onChange({
      ...project,
      screens: project.screens.map((screen) => (screen.id === id ? { ...screen, ...patch } : screen)),
    });
  }

  return (
    <section className="module-panel">
      <p className="eyebrow">UI Sketch Lab</p>
      <h1>Paper first. Prototype second.</h1>
      <p className="lede">Draw the screens on paper, then record the decisions that Codex must preserve.</p>
      <div className="screen-grid">
        {project.screens.map((screen) => (
          <article className="screen-card" key={screen.id}>
            <div className="screen-card-header">
              <h2>{screen.name}</h2>
              <span>{screen.id === "impact" ? "Later evidence" : "Required for handoff"}</span>
            </div>
            <Field
              label={`${screen.name} paper sketch ref`}
              value={screen.paperSketchReference}
              onChange={(value) => updateScreen(screen.id, { paperSketchReference: value })}
              placeholder="Paper 1, photo A, or 图1"
            />
            <Field
              label={`${screen.name} job`}
              value={screen.job}
              onChange={(value) => updateScreen(screen.id, { job: value })}
              placeholder="One screen, one job"
            />
            <Field
              label={`${screen.name} user action`}
              value={screen.userAction}
              onChange={(value) => updateScreen(screen.id, { userAction: value })}
              placeholder="What should the user do here?"
            />
            <Field
              label={`${screen.name} main button`}
              value={screen.mainButtonLabel}
              onChange={(value) => updateScreen(screen.id, { mainButtonLabel: value })}
              placeholder="Button label"
            />
            <Field
              label={`${screen.name} input needed`}
              value={screen.inputNeeded}
              onChange={(value) => updateScreen(screen.id, { inputNeeded: value })}
              placeholder="What information appears or gets entered?"
            />
            <Field
              label={`${screen.name} output shown`}
              value={screen.outputShown}
              onChange={(value) => updateScreen(screen.id, { outputShown: value })}
              placeholder="What does the user see?"
            />
            <Field
              label={`${screen.name} feedback`}
              value={screen.feedbackState}
              onChange={(value) => updateScreen(screen.id, { feedbackState: value })}
              placeholder="What changes after action?"
            />
            <Field
              label={`${screen.name} trust signal`}
              value={screen.trustSignal}
              onChange={(value) => updateScreen(screen.id, { trustSignal: value })}
              placeholder="How can users check or trust it?"
            />
          </article>
        ))}
      </div>
    </section>
  );
}
