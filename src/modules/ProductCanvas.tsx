import { Field } from "../components/Field";
import { StatusPill } from "../components/StatusPill";
import { getProjectReadiness } from "../domain/readiness";
import type { StudioProject } from "../domain/types";

interface ProductCanvasProps {
  project: StudioProject;
  onChange: (project: StudioProject) => void;
}

const canvasCuesByPrinciple = new Map([
  [
    "One product, one main message, one clear action.",
    "Project title, seed idea, and output should point to one clear promise.",
  ],
  [
    "Use one strong visual and a few powerful words to make people feel something.",
    "Problem and user moment should describe a feeling the prototype can show on screen.",
  ],
  [
    "Make the user feel the product understands their taste, identity, or mood.",
    "Specific user should be narrow enough that the product can feel personal.",
  ],
  [
    "Give fast feedback through color, sound, progress, and rewards.",
    "Output should name what the user sees after each action, not just what the AI thinks.",
  ],
]);

function getCanvasCue(principle: string): string {
  return canvasCuesByPrinciple.get(principle) ?? "Choose one canvas answer this rule should change.";
}

export function ProductCanvas({ project, onChange }: ProductCanvasProps) {
  const readiness = Object.values(getProjectReadiness(project));
  const hasBorrowedPrinciples = project.borrowedPrinciples.length > 0;

  function updateField<K extends keyof StudioProject>(key: K, value: StudioProject[K]) {
    onChange({ ...project, [key]: value });
  }

  return (
    <section className="module-panel">
      <p className="eyebrow">Product Canvas</p>
      <h1>Make the idea buildable.</h1>
      <p className="lede">Codex stays locked until the project is specific enough to explain in 20 seconds.</p>
      <div className="canvas-layout">
        <div className="form-grid">
          <Field label="Project title" value={project.title} onChange={(value) => updateField("title", value)} placeholder="Lunch Lens" />
          <Field
            label="Seed idea"
            value={project.seedIdea}
            onChange={(value) => updateField("seedIdea", value)}
            placeholder="A small idea worth investigating"
          />
          <Field
            label="Problem"
            value={project.problem}
            onChange={(value) => updateField("problem", value)}
            placeholder="What is difficult, slow, unfair, risky, confusing, or easy to forget?"
            multiline
          />
          <Field
            label="Specific user"
            value={project.user}
            onChange={(value) => updateField("user", value)}
            placeholder="A real user group in a real context"
          />
          <Field
            label="User moment"
            value={project.userMoment}
            onChange={(value) => updateField("userMoment", value)}
            placeholder="When and where would they open this?"
          />
          <Field
            label="Input"
            value={project.input}
            onChange={(value) => updateField("input", value)}
            placeholder="What does the user give the product?"
          />
          <Field
            label="AI action"
            value={project.aiAction}
            onChange={(value) => updateField("aiAction", value)}
            placeholder="Classify, recommend, generate, chat, predict"
          />
          <Field
            label="Output"
            value={project.output}
            onChange={(value) => updateField("output", value)}
            placeholder="What useful result appears on screen?"
            multiline
          />
          <Field
            label="Impact"
            value={project.impact}
            onChange={(value) => updateField("impact", value)}
            placeholder="What changes if this works?"
            multiline
          />
          <Field
            label="Responsible AI note"
            value={project.responsibleAiNote}
            onChange={(value) => updateField("responsibleAiNote", value)}
            placeholder="What needs human review or caution?"
            multiline
          />
        </div>
        <aside className="canvas-card">
          {hasBorrowedPrinciples ? (
            <section className="canvas-rule-section" aria-labelledby="canvas-design-rules-heading">
              <h2 id="canvas-design-rules-heading">Borrowed design rules</h2>
              <p>Use these as decision checks while filling the canvas.</p>
              <ul className="canvas-rule-list" aria-label="Canvas borrowed design rules">
                {project.borrowedPrinciples.map((principle) => (
                  <li className="canvas-rule-item" key={principle}>
                    <strong>{principle}</strong>
                    <span className="canvas-rule-cue">
                      <span className="canvas-rule-cue-label">Where this should show up:</span>
                      {getCanvasCue(principle)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          <section className="canvas-support-section">
            <h2>Specificity check</h2>
            <p>
              Too vague: <strong>An AI app to help the environment.</strong>
            </p>
            <p>
              Buildable: <strong>A lunch waste helper for Grade 6 students near the sorting bins after lunch.</strong>
            </p>
            <div className="readiness-list">
              {readiness.map((item) => (
                <div className="readiness-row" key={item.label}>
                  <span>{item.label}</span>
                  <StatusPill ready={item.ready} label={item.ready ? "Ready" : "Needs work"} />
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}
