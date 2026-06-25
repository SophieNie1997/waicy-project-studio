import { generateCodexPrompt } from "../domain/codexPrompt";
import { canUnlockCodex, getProjectReadiness } from "../domain/readiness";
import type { StudioProject } from "../domain/types";

interface CodexBuildDeskProps {
  project: StudioProject;
}

export function CodexBuildDesk({ project }: CodexBuildDeskProps) {
  const unlocked = canUnlockCodex(project);
  const prompt = generateCodexPrompt(project);
  const missingItems = Object.values(getProjectReadiness(project)).filter((item) => !item.ready);

  function copyPrompt() {
    void navigator.clipboard?.writeText(prompt);
  }

  return (
    <section className="module-panel">
      <p className="eyebrow">Codex Build Desk</p>
      <h1>Teacher turns student design into v1.</h1>
      <p className="lede">The prompt is manually copied by the teacher after student decisions are complete.</p>
      {!unlocked ? (
        <div className="lock-panel">
          <h2>Codex is locked</h2>
          <p>Complete Product Canvas and the required paper-first screen decisions before building.</p>
          <div className="missing-list">
            {missingItems.map((item) => (
              <p key={item.label}>
                <strong>{item.label}:</strong> {item.guidance}
              </p>
            ))}
          </div>
        </div>
      ) : (
        <div className="prompt-panel">
          <h2>Generated Codex prompt</h2>
          <pre>{prompt}</pre>
          <button className="secondary-button" type="button" onClick={copyPrompt}>
            Copy prompt
          </button>
        </div>
      )}
    </section>
  );
}
