import { useState } from "react";
import { MissionBanner } from "../components/MissionBanner";
import { StatusPill } from "../components/StatusPill";
import { getProjectReadiness } from "../domain/readiness";
import type { StudioProject } from "../domain/types";

interface ProductCanvasProps {
  project: StudioProject;
  onChange: (project: StudioProject) => void;
}

interface CanvasDesignRule {
  label: string;
  shortRule: string;
  cue: string;
}

interface BuilderPrompt {
  label: string;
  value: string;
}

interface BuilderDecision {
  key:
    | "problem"
    | "user"
    | "userMoment"
    | "input"
    | "aiAction"
    | "output"
    | "impact"
    | "responsibleAiNote";
  label: string;
  title: string;
  question: string;
  coach: string;
  placeholder: string;
  multiline?: boolean;
  prompts: BuilderPrompt[];
}

const canvasRulesByPrinciple = new Map<string, CanvasDesignRule>([
  [
    "One product, one main message, one clear action.",
    {
      label: "Focus",
      shortRule: "One clear promise",
      cue: "Check: title, seed idea, output.",
    },
  ],
  [
    "Use one strong visual and a few powerful words to make people feel something.",
    {
      label: "Emotion",
      shortRule: "One feeling",
      cue: "Check: problem, user moment.",
    },
  ],
  [
    "Make the user feel the product understands their taste, identity, or mood.",
    {
      label: "Belonging",
      shortRule: "One specific user",
      cue: "Check: specific user.",
    },
  ],
  [
    "Give fast feedback through color, sound, progress, and rewards.",
    {
      label: "Feedback",
      shortRule: "One fast response",
      cue: "Check: output and screen feedback.",
    },
  ],
]);

const builderDecisions: BuilderDecision[] = [
  {
    key: "problem",
    label: "Problem",
    title: "Pick the real problem",
    question: "What annoying or unfair moment is worth fixing?",
    coach: "Aim for a small scene another student could recognize.",
    placeholder: "What is difficult, slow, unfair, risky, confusing, or easy to forget?",
    multiline: true,
    prompts: [
      {
        label: "Lunch sorting table",
        value: "Lunch waste gets sorted wrong when the bins are crowded.",
      },
      {
        label: "Forgotten club gear",
        value: "Students forget which club items to bring until it is too late.",
      },
      {
        label: "Group work confusion",
        value: "Teams lose track of who is doing which job during group projects.",
      },
    ],
  },
  {
    key: "user",
    label: "Specific user",
    title: "Choose who needs help",
    question: "Which real group should this product serve first?",
    coach: "Avoid everyone. A narrow first user makes the app easier to build.",
    placeholder: "A real user group in a real context",
    prompts: [
      {
        label: "Grade 6 lunch monitors",
        value: "Grade 6 lunch monitors near the sorting bins after lunch.",
      },
      {
        label: "New club members",
        value: "Students joining a club for the first time this semester.",
      },
      {
        label: "Project team leaders",
        value: "Grade 6 team leaders managing a four-person project group.",
      },
    ],
  },
  {
    key: "userMoment",
    label: "User moment",
    title: "Place it in a moment",
    question: "When would they open this instead of ignoring it?",
    coach: "A strong moment has a place, time, and pressure.",
    placeholder: "When and where would they open this?",
    prompts: [
      {
        label: "Right after lunch",
        value: "Right after lunch, while standing near the crowded sorting bins.",
      },
      {
        label: "Before class starts",
        value: "In the hallway five minutes before class starts.",
      },
      {
        label: "During team planning",
        value: "At the start of a group project meeting when jobs are unclear.",
      },
    ],
  },
  {
    key: "input",
    label: "Input",
    title: "Give the AI something useful",
    question: "What does the user show, type, or choose?",
    coach: "Keep the input simple enough for a prototype.",
    placeholder: "What does the user give the product?",
    prompts: [
      {
        label: "Photo",
        value: "A quick photo of the item or situation.",
      },
      {
        label: "Three choices",
        value: "Three choices selected from simple buttons.",
      },
      {
        label: "Short note",
        value: "One short sentence describing what is happening.",
      },
    ],
  },
  {
    key: "aiAction",
    label: "AI action",
    title: "Name the AI move",
    question: "What should the AI do with that input?",
    coach: "Use a verb students can explain without technical words.",
    placeholder: "Classify, recommend, generate, chat, predict",
    prompts: [
      {
        label: "Classify",
        value: "Classify the item and explain which bin it belongs in.",
      },
      {
        label: "Recommend",
        value: "Recommend the next best action with one reason.",
      },
      {
        label: "Generate",
        value: "Generate a short plan the student can follow immediately.",
      },
    ],
  },
  {
    key: "output",
    label: "Output",
    title: "Make the result visible",
    question: "What appears on screen after the AI helps?",
    coach: "A prototype needs something showable: a label, checklist, route, or message.",
    placeholder: "What useful result appears on screen?",
    multiline: true,
    prompts: [
      {
        label: "Color answer",
        value: "A big color label, one reason, and a next-step button.",
      },
      {
        label: "Checklist",
        value: "A short checklist with the next three actions.",
      },
      {
        label: "Confidence note",
        value: "A recommendation with a confidence level and a human-check reminder.",
      },
    ],
  },
  {
    key: "impact",
    label: "Impact",
    title: "Show what changes",
    question: "If this works, what gets better for the user?",
    coach: "Impact should be observable, not just nice-sounding.",
    placeholder: "What changes if this works?",
    multiline: true,
    prompts: [
      {
        label: "Faster decision",
        value: "Students make the right choice faster and ask teachers fewer repeated questions.",
      },
      {
        label: "Less confusion",
        value: "The group spends less time arguing and more time doing the task.",
      },
      {
        label: "More confidence",
        value: "New students feel less nervous because the next step is clear.",
      },
    ],
  },
  {
    key: "responsibleAiNote",
    label: "Responsible AI note",
    title: "Add a human check",
    question: "Where should a person still review or be careful?",
    coach: "Responsible AI is part of the product, not a warning stuck on at the end.",
    placeholder: "What needs human review or caution?",
    multiline: true,
    prompts: [
      {
        label: "Ask a teacher",
        value: "If the AI is unsure, the app asks the student to check with a teacher.",
      },
      {
        label: "No faces",
        value: "The prototype should not store photos of faces or private student information.",
      },
      {
        label: "Explain why",
        value: "The app should always show a reason, not just give an answer.",
      },
    ],
  },
];

function getCanvasRule(principle: string): CanvasDesignRule {
  return (
    canvasRulesByPrinciple.get(principle) ?? {
      label: "Rule",
      shortRule: principle,
      cue: "Check: choose one canvas answer this should change.",
    }
  );
}

function buildBrief(project: StudioProject): string {
  const user = project.user.trim() || "someone specific";
  const problem = project.problem.trim() || "a real problem appears";
  const moment = project.userMoment.trim() || "in one clear moment";
  const input = project.input.trim() || "one simple input";
  const aiAction = project.aiAction.trim() || "help make a decision";
  const output = project.output.trim() || "a useful result";
  const impact = project.impact.trim() || "the next action feels easier";
  const problemSentence = problem.endsWith(".") || problem.endsWith("?") || problem.endsWith("!") ? problem : `${problem}.`;

  return `This project helps ${user} when this happens: ${problemSentence} They open it ${moment}, give it ${input}, and the AI will ${aiAction}. The screen shows ${output} so ${impact}`;
}

export function ProductCanvas({ project, onChange }: ProductCanvasProps) {
  const [activeDecisionIndex, setActiveDecisionIndex] = useState(0);
  const readiness = Object.values(getProjectReadiness(project));
  const hasBorrowedPrinciples = project.borrowedPrinciples.length > 0;
  const activeDecision = builderDecisions[activeDecisionIndex];
  const activeValue = project[activeDecision.key];
  const completedDecisions = builderDecisions.filter((decision) => project[decision.key].trim()).length;

  function updateField<K extends keyof StudioProject>(key: K, value: StudioProject[K]) {
    onChange({ ...project, [key]: value });
  }

  function updateDecision(value: string) {
    updateField(activeDecision.key, value);
  }

  function moveDecision(direction: 1 | -1) {
    setActiveDecisionIndex((current) => Math.min(Math.max(current + direction, 0), builderDecisions.length - 1));
  }

  return (
    <section className="module-panel">
      <p className="eyebrow">Make Idea Real</p>
      <h1>Make the idea buildable.</h1>
      <p className="lede">Codex stays locked until the project is specific enough to explain in 20 seconds.</p>
      <MissionBanner
        title="Make one idea specific enough that another person can picture it."
        detail="Name the user, the moment, the AI action, and what appears on screen."
        progress="Project brief"
      />
      {hasBorrowedPrinciples ? (
        <section className="canvas-rule-strip" aria-labelledby="canvas-design-rules-heading">
          <div>
            <h2 id="canvas-design-rules-heading">Design moves you collected</h2>
            <p>Use these moves while you make product decisions.</p>
          </div>
          <ul className="canvas-rule-strip-list" aria-label="Canvas collected design moves">
            {project.borrowedPrinciples.map((principle) => {
              const rule = getCanvasRule(principle);
              return (
                <li className="canvas-rule-chip" key={principle}>
                  <span className="canvas-rule-label">{rule.label}</span>
                  <strong>{rule.shortRule}</strong>
                  <span>{rule.cue}</span>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
      <div className="canvas-layout">
        <section className="idea-builder" aria-labelledby="idea-builder-heading">
          <div className="idea-builder-topline">
            <div>
              <p className="builder-kicker">Decision {activeDecisionIndex + 1} of {builderDecisions.length}</p>
              <h2 id="idea-builder-heading">Idea Builder</h2>
            </div>
            <span className="builder-progress">{completedDecisions}/{builderDecisions.length} decisions shaped</span>
          </div>

          <div className="project-identity-strip" aria-label="Project identity">
            <label>
              <span>Project title</span>
              <input
                value={project.title}
                placeholder="Lunch Lens"
                onChange={(event) => updateField("title", event.target.value)}
              />
            </label>
            <label>
              <span>Seed idea</span>
              <input
                value={project.seedIdea}
                placeholder="A small idea worth investigating"
                onChange={(event) => updateField("seedIdea", event.target.value)}
              />
            </label>
          </div>

          <div className="decision-rail" aria-label="Idea Builder decisions">
            {builderDecisions.map((decision, index) => {
              const isActive = index === activeDecisionIndex;
              const isComplete = project[decision.key].trim().length > 0;

              return (
                <button
                  className={`decision-dot ${isActive ? "active" : ""} ${isComplete ? "complete" : ""}`}
                  key={decision.key}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActiveDecisionIndex(index)}
                >
                  <span>{index + 1}</span>
                  {decision.label}
                </button>
              );
            })}
          </div>

          <article className="decision-card">
            <div className="decision-card-copy">
              <p className="builder-kicker">{activeDecision.label}</p>
              <h3>{activeDecision.title}</h3>
              <p>{activeDecision.question}</p>
              <span>{activeDecision.coach}</span>
            </div>

            <div className="prompt-chip-row" aria-label={`${activeDecision.label} idea starters`}>
              {activeDecision.prompts.map((prompt) => (
                <button
                  className="prompt-chip"
                  key={prompt.label}
                  type="button"
                  onClick={() => updateDecision(prompt.value)}
                >
                  {prompt.label}
                </button>
              ))}
            </div>

            <label className="builder-field" htmlFor={`builder-${activeDecision.key}`}>
              <span>{activeDecision.label}</span>
              {activeDecision.multiline ? (
                <textarea
                  id={`builder-${activeDecision.key}`}
                  value={activeValue}
                  placeholder={activeDecision.placeholder}
                  onChange={(event) => updateDecision(event.target.value)}
                />
              ) : (
                <input
                  id={`builder-${activeDecision.key}`}
                  value={activeValue}
                  placeholder={activeDecision.placeholder}
                  onChange={(event) => updateDecision(event.target.value)}
                />
              )}
            </label>

            <div className="builder-actions">
              <button
                className="secondary-button"
                type="button"
                disabled={activeDecisionIndex === 0}
                onClick={() => moveDecision(-1)}
              >
                Previous decision
              </button>
              <button
                className="primary-button"
                type="button"
                disabled={activeDecisionIndex === builderDecisions.length - 1}
                onClick={() => moveDecision(1)}
              >
                Next decision
              </button>
            </div>
          </article>

          <aside className="live-brief" aria-label="Live product brief">
            <p>Live brief</p>
            <strong>{project.title.trim() || "Untitled project"}</strong>
            <span>{buildBrief(project)}.</span>
          </aside>
        </section>
        <aside className="canvas-card" aria-labelledby="specificity-check-heading">
          <section className="canvas-support-section">
            <h2 id="specificity-check-heading">Specificity check</h2>
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
