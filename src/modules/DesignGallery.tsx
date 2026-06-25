import type { StudioProject } from "../domain/types";

interface DesignGalleryProps {
  project: StudioProject;
  onChange: (project: StudioProject) => void;
  onContinue: () => void;
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
    name: "Nike",
    lesson: "Emotion",
    url: "https://www.nike.com/",
    image: "references/nike.jpg",
    principle: "Use one strong visual and a few powerful words to make people feel something.",
    question: "What emotion does the page create before it explains anything?",
  },
  {
    name: "Spotify",
    lesson: "Belonging",
    url: "https://www.spotify.com/us/premium/",
    image: "references/spotify.jpg",
    principle: "Make the user feel the product understands their taste, identity, or mood.",
    question: "How does the page make a service feel personal?",
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

export function DesignGallery({ project, onChange, onContinue }: DesignGalleryProps) {
  const borrowedCount = project.borrowedPrinciples.length;
  const borrowedStatus =
    borrowedCount === 1 ? "1 design rule borrowed" : `${borrowedCount} design rules borrowed`;
  const nextStepGuidance =
    borrowedCount > 2
      ? "You borrowed several. Circle the strongest 1-2 rules, then use them as the design spine for your product."
      : "Use the borrowed rule to shape the first version of your product idea.";

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
      <div className={`borrowed-feedback ${borrowedCount > 0 ? "has-borrowed" : ""}`} role="status" aria-live="polite">
        <p className="borrowed-count">{borrowedCount > 0 ? borrowedStatus : "No design rules borrowed yet"}</p>
        <p>
          {borrowedCount > 0
            ? "These rules will travel into the Product Canvas, teacher review, and Codex handoff."
            : "Choose one or two rules that should shape the students' own prototype."}
        </p>
        {borrowedCount > 0 ? (
          <>
            <ul className="borrowed-list" aria-label="Borrowed design rules">
              {project.borrowedPrinciples.map((principle) => (
                <li key={principle}>{principle}</li>
              ))}
            </ul>
            <div className="next-step-panel">
              <p>
                <strong>Next step:</strong> {nextStepGuidance}
              </p>
              <button className="secondary-button compact-action" type="button" onClick={onContinue}>
                Go to Product Canvas
              </button>
            </div>
          </>
        ) : null}
      </div>
      <div className="reference-grid">
        {references.map((reference) => {
          const isBorrowed = project.borrowedPrinciples.includes(reference.principle);
          return (
            <article className={`reference-card ${isBorrowed ? "borrowed-card" : ""}`} key={reference.name}>
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
              <button
                aria-pressed={isBorrowed}
                className={`secondary-button ${isBorrowed ? "borrowed-action" : ""}`}
                type="button"
                onClick={() => togglePrinciple(reference.principle)}
              >
                {isBorrowed ? "Borrowed" : "Borrow this rule"}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
