import { Field } from "../components/Field";
import { StatusPill } from "../components/StatusPill";
import { getProjectReadiness } from "../domain/readiness";
import type { StudioProject } from "../domain/types";

interface ProductCanvasProps {
  project: StudioProject;
  onChange: (project: StudioProject) => void;
}

export function ProductCanvas({ project, onChange }: ProductCanvasProps) {
  const readiness = Object.values(getProjectReadiness(project));

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
        </aside>
      </div>
    </section>
  );
}
