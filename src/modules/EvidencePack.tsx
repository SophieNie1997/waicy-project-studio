import { generateEvidencePack } from "../domain/evidence";
import type { StudioProject } from "../domain/types";

interface EvidencePackProps {
  project: StudioProject;
}

export function EvidencePack({ project }: EvidencePackProps) {
  const pack = generateEvidencePack(project);

  function copy(text: string) {
    void navigator.clipboard?.writeText(text);
  }

  return (
    <section className="module-panel">
      <p className="eyebrow">Evidence Pack</p>
      <h1>Turn process into story.</h1>
      <p className="lede">Use the same evidence for the final PDF and video.</p>
      <div className="evidence-grid">
        <article>
          <h2>What</h2>
          <p>{pack.whatNotes}</p>
        </article>
        <article>
          <h2>Why</h2>
          <p>{pack.whyNotes}</p>
        </article>
        <article>
          <h2>How</h2>
          <p>{pack.howNotes}</p>
        </article>
        <article>
          <h2>Impact</h2>
          <p>{pack.impactNotes}</p>
        </article>
      </div>
      <div className="evidence-grid compact">
        <article>
          <h2>Screenshot list</h2>
          <ul>
            {pack.screenshotList.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
        <article>
          <h2>Before / After</h2>
          <p>{pack.beforeAfterComparison}</p>
        </article>
        <article>
          <h2>Responsible AI</h2>
          <p>{pack.responsibleAiStatement}</p>
        </article>
        <article>
          <h2>Future Potential</h2>
          <p>{pack.futurePotential}</p>
        </article>
      </div>
      <div className="export-grid">
        <section className="prompt-panel">
          <h2>PDF outline</h2>
          <pre>{pack.pdfOutline}</pre>
          <button className="secondary-button" type="button" onClick={() => copy(pack.pdfOutline)}>
            Copy PDF outline
          </button>
        </section>
        <section className="prompt-panel">
          <h2>Video script</h2>
          <pre>{pack.videoScriptOutline}</pre>
          <button className="secondary-button" type="button" onClick={() => copy(pack.videoScriptOutline)}>
            Copy video script
          </button>
        </section>
      </div>
    </section>
  );
}
