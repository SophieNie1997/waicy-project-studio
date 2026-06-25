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
    name: "Code.org",
    lesson: "Guided Start",
    url: "https://code.org/en-US/students/middle-and-high-school",
    image: "references/codeorg.jpg",
    principle: "Use age-right paths and clear starting points so beginners know where to begin.",
    question: "How does the page lower the fear of starting AI or coding?",
  },
  {
    name: "Scratch",
    lesson: "Workflow",
    url: "https://scratch.mit.edu/projects/editor/?tutorial=all",
    image: "references/scratch.jpg",
    principle: "Make the making process visible: blocks, stage, and result stay on one screen.",
    question: "Where can you see what to change and what happens next?",
  },
  {
    name: "Duolingo App",
    lesson: "Feedback",
    url: "https://usabilitygeek.com/ux-case-study-duolingo/",
    image: "references/duolingo-app-feedback.jpg",
    principle: "Give fast feedback through color, sound, progress, and rewards.",
    question: "How does the app show correct, wrong, progress, and motivation?",
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
