import type { StudioProject } from "../domain/types";

interface DesignGalleryProps {
  project: StudioProject;
  onChange: (project: StudioProject) => void;
}

const references = [
  {
    name: "Apple",
    lesson: "Focus",
    url: "https://www.apple.com/",
    image: "references/apple.jpg",
    principle: "One product, one main message, one clear action.",
    question: "What do your eyes notice first, second, and third?",
  },
  {
    name: "Stripe",
    lesson: "Explain",
    url: "https://stripe.com/",
    image: "references/stripe.jpg",
    principle: "Use visuals to make a complex system understandable.",
    question: "How does the page explain something hard without a long paragraph?",
  },
  {
    name: "Linear",
    lesson: "Workflow",
    url: "https://linear.app/",
    image: "references/linear.jpg",
    principle: "Show the real steps a user takes.",
    question: "Where can you see the workflow?",
  },
  {
    name: "Duolingo",
    lesson: "Feedback",
    url: "https://www.duolingo.com/",
    image: "references/duolingo.jpg",
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
            <a
              className="reference-preview"
              href={reference.url}
              target="_blank"
              rel="noreferrer"
              aria-label={`Open ${reference.name} website`}
            >
              <img src={reference.image} alt={`${reference.name} website preview`} loading="lazy" />
              <span className="reference-open-label">Open site</span>
            </a>
            <h2>
              <a className="reference-title-link" href={reference.url} target="_blank" rel="noreferrer">
                {reference.name}: {reference.lesson}
              </a>
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
