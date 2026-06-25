import { useState } from "react";
import { Field } from "../components/Field";
import { MissionBanner } from "../components/MissionBanner";
import type { StudioProject, StudioScreen } from "../domain/types";

interface UISketchLabProps {
  project: StudioProject;
  onChange: (project: StudioProject) => void;
}

export function UISketchLab({ project, onChange }: UISketchLabProps) {
  const [activeScreenId, setActiveScreenId] = useState<StudioScreen["id"]>("start");
  const activeIndex = Math.max(
    0,
    project.screens.findIndex((screen) => screen.id === activeScreenId),
  );
  const activeScreen = project.screens[activeIndex] ?? project.screens[0];

  function updateScreen(id: StudioScreen["id"], patch: Partial<StudioScreen>) {
    onChange({
      ...project,
      screens: project.screens.map((screen) => (screen.id === id ? { ...screen, ...patch } : screen)),
    });
  }

  function moveScreen(direction: -1 | 1) {
    const nextIndex = Math.min(project.screens.length - 1, Math.max(0, activeIndex + direction));
    setActiveScreenId(project.screens[nextIndex].id);
  }

  return (
    <section className="module-panel">
      <p className="eyebrow">Draw App Screens</p>
      <h1>Paper first. Prototype second.</h1>
      <p className="lede">Draw the screens on paper, then record the decisions that Codex must preserve.</p>
      <MissionBanner
        title="Draw one screen at a time, then record the choices Codex must preserve."
        detail="Start with paper. This page is for naming what each sketch must do."
        progress={`Screen ${activeIndex + 1} of ${project.screens.length}`}
      />
      <div className="screen-stepper" aria-label="Screen sketch steps">
        {project.screens.map((screen, index) => (
          <button
            aria-current={screen.id === activeScreen.id ? "step" : undefined}
            className={`screen-step ${screen.id === activeScreen.id ? "active" : ""}`}
            key={screen.id}
            onClick={() => setActiveScreenId(screen.id)}
            type="button"
          >
            <span>{index + 1}</span>
            {screen.name}
          </button>
        ))}
      </div>
      <article className="screen-card screen-card-focused" key={activeScreen.id}>
        <div className="screen-card-header">
          <div>
            <p className="screen-progress">Screen {activeIndex + 1} of {project.screens.length}</p>
            <h2>{activeScreen.name}</h2>
          </div>
          <span>{activeScreen.id === "impact" ? "Later evidence" : "Required for handoff"}</span>
        </div>
        <div className="screen-form-grid">
          <Field
            label={`${activeScreen.name} paper sketch ref`}
            value={activeScreen.paperSketchReference}
            onChange={(value) => updateScreen(activeScreen.id, { paperSketchReference: value })}
            placeholder="Paper 1, photo A, or 图1"
          />
          <Field
            label={`${activeScreen.name} job`}
            value={activeScreen.job}
            onChange={(value) => updateScreen(activeScreen.id, { job: value })}
            placeholder="One screen, one job"
          />
          <Field
            label={`${activeScreen.name} user action`}
            value={activeScreen.userAction}
            onChange={(value) => updateScreen(activeScreen.id, { userAction: value })}
            placeholder="What should the user do here?"
          />
          <Field
            label={`${activeScreen.name} main button`}
            value={activeScreen.mainButtonLabel}
            onChange={(value) => updateScreen(activeScreen.id, { mainButtonLabel: value })}
            placeholder="Button label"
          />
          <Field
            label={`${activeScreen.name} input needed`}
            value={activeScreen.inputNeeded}
            onChange={(value) => updateScreen(activeScreen.id, { inputNeeded: value })}
            placeholder="What information appears or gets entered?"
          />
          <Field
            label={`${activeScreen.name} output shown`}
            value={activeScreen.outputShown}
            onChange={(value) => updateScreen(activeScreen.id, { outputShown: value })}
            placeholder="What does the user see?"
          />
          <Field
            label={`${activeScreen.name} feedback`}
            value={activeScreen.feedbackState}
            onChange={(value) => updateScreen(activeScreen.id, { feedbackState: value })}
            placeholder="What changes after action?"
          />
          <Field
            label={`${activeScreen.name} trust signal`}
            value={activeScreen.trustSignal}
            onChange={(value) => updateScreen(activeScreen.id, { trustSignal: value })}
            placeholder="How can users check or trust it?"
          />
        </div>
        <div className="screen-actions">
          <button className="secondary-button compact-action" disabled={activeIndex === 0} onClick={() => moveScreen(-1)} type="button">
            Previous screen
          </button>
          <button
            className="secondary-button compact-action borrowed-action"
            disabled={activeIndex === project.screens.length - 1}
            onClick={() => moveScreen(1)}
            type="button"
          >
            Next screen
          </button>
        </div>
      </article>
    </section>
  );
}
