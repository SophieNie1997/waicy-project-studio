import type { StudioProject } from "../domain/types";

interface DesignGalleryProps {
  project: StudioProject;
  onChange: (project: StudioProject) => void;
}

const references = [
  {
    name: "Apple",
    lesson: "Focus",
    principle: "One product, one main message, one clear action.",
    question: "What do your eyes notice first, second, and third?",
  },
  {
    name: "Stripe",
    lesson: "Explain",
    principle: "Use visuals to make a complex system understandable.",
    question: "How does the page explain something hard without a long paragraph?",
  },
  {
    name: "Linear",
    lesson: "Workflow",
    principle: "Show the real steps a user takes.",
    question: "Where can you see the workflow?",
  },
  {
    name: "Duolingo",
    lesson: "Feedback",
    principle: "Make progress, mistakes, and rewards visible.",
    question: "How does the product make users want to continue?",
  },
];

export function DesignGallery({ project, onChange }: DesignGalleryProps) {
  function togglePrinciple(principle: string) {
    const exists = project.borrowedPrinciples.includes(principle);
    onChange({
      ...project,
      borrowedPrinciples: exists
        ? project.borrowedPrinciples.filter((item) => item !== principle)
        : [...project.borrowedPrinciples, principle],
    });
  }

  return (
    <section className="module-panel">
      <p className="eyebrow">Design Gallery</p>
      <h1>Look, notice, borrow.</h1>
      <p className="lede">Study strong websites to extract design principles for your own product.</p>
      <div className="reference-grid">
        {references.map((reference) => (
          <article className="reference-card" key={reference.name}>
            <div className="reference-visual" aria-hidden="true">
              <span>{reference.name}</span>
              <small>{reference.lesson}</small>
            </div>
            <h2>
              {reference.name}: {reference.lesson}
            </h2>
            <p>{reference.principle}</p>
            <strong>{reference.question}</strong>
            <button className="secondary-button" type="button" onClick={() => togglePrinciple(reference.principle)}>
              {project.borrowedPrinciples.includes(reference.principle) ? "Borrowed" : "Borrow this rule"}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
