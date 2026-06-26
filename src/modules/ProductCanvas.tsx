import { useLayoutEffect, useRef, useState } from "react";
import { MissionBanner } from "../components/MissionBanner";
import { StatusPill } from "../components/StatusPill";
import { getProjectReadiness } from "../domain/readiness";
import type { StudioProject, StudioScreen } from "../domain/types";

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

type ChoiceGenerationStatus = "idle" | "loading" | "model" | "backup";

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

type IdeaChoiceSet = Partial<Record<BuilderDecision["key"], BuilderPrompt[]>>;

interface IdeaChoiceResult {
  choices: IdeaChoiceSet;
  source: "model" | "backup";
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

const REQUIRED_PAPER_SCREEN_IDS = ["start", "input", "ai-result", "human-review"] as const;
const DEFAULT_PRODUCTION_IDEA_CHOICES_ENDPOINT = "https://waicy-project-studio-api.vercel.app/api/idea-choices";
type RequiredPaperScreenId = (typeof REQUIRED_PAPER_SCREEN_IDS)[number];

const readinessLabelByDecisionKey: Partial<Record<BuilderDecision["key"], string>> = {
  problem: "Real problem",
  user: "Specific user",
  userMoment: "User moment",
  aiAction: "AI action",
  output: "Showable output",
  responsibleAiNote: "Responsible AI",
};

const screenDraftsById: Record<RequiredPaperScreenId, Pick<StudioScreen, "job" | "userAction" | "mainButtonLabel" | "feedbackState" | "trustSignal">> = {
  start: {
    job: "Introduce the project and show who it helps.",
    userAction: "Read the promise and choose to start.",
    mainButtonLabel: "Start",
    feedbackState: "The app moves into the first useful step.",
    trustSignal: "The page says this is a student prototype.",
  },
  input: {
    job: "Collect the simple information the AI needs.",
    userAction: "Add one photo, choice, or short note.",
    mainButtonLabel: "Check it",
    feedbackState: "The app shows that the input was received.",
    trustSignal: "The page explains what information is used.",
  },
  "ai-result": {
    job: "Show the AI result in a clear way.",
    userAction: "Read the result and compare it with the reason.",
    mainButtonLabel: "Use this",
    feedbackState: "The app highlights the recommended next step.",
    trustSignal: "The page shows a reason and confidence note.",
  },
  "human-review": {
    job: "Let a person check or correct the AI answer.",
    userAction: "Choose confirm, change, or ask for help.",
    mainButtonLabel: "Review",
    feedbackState: "The app records the human decision.",
    trustSignal: "The page reminds users that people make the final call.",
  },
};

function isRequiredPaperScreenId(id: StudioScreen["id"]): id is RequiredPaperScreenId {
  return REQUIRED_PAPER_SCREEN_IDS.includes(id as RequiredPaperScreenId);
}

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

function isUsefulTopic(value: string): boolean {
  const trimmed = value.trim();
  const latinLetters = trimmed.match(/[a-z]/gi)?.length ?? 0;
  const cjkCharacters = trimmed.match(/\p{Script=Han}/gu)?.length ?? 0;

  return latinLetters >= 3 || cjkCharacters >= 2;
}

function shortenTopic(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .slice(0, 4)
    .join(" ");
}

function getProjectTopic(project: StudioProject): string {
  if (isUsefulTopic(project.title)) return shortenTopic(project.title);
  if (isUsefulTopic(project.seedIdea)) return shortenTopic(project.seedIdea);

  return "";
}

function getBackupDecisionPrompts(decision: BuilderDecision, project: StudioProject): BuilderPrompt[] {
  const topic = getProjectTopic(project);
  if (!topic) return decision.prompts;

  const seed = project.seedIdea.trim() || `${topic} idea`;

  switch (decision.key) {
    case "problem":
      return [
        {
          label: `${topic} tricky choice`,
          value: `Students are not sure which ${topic} choice fits the real situation.`,
        },
        {
          label: `${topic} comfort check`,
          value: `Students need a quick way to check whether ${seed.toLowerCase()} is safe, fair, or comfortable.`,
        },
        {
          label: `${topic} repeated asks`,
          value: `Students keep asking the same ${topic} question because the right next step is not visible.`,
        },
      ];
    case "user":
      return [
        {
          label: `${topic} first users`,
          value: `Grade 6 students who are trying ${topic} for the first time.`,
        },
        {
          label: `${topic} helpers`,
          value: `Student helpers responsible for making ${topic} work during a busy school day.`,
        },
        {
          label: `${topic} team leaders`,
          value: `Team leaders who need to guide classmates through ${topic}.`,
        },
      ];
    case "userMoment":
      return [
        {
          label: `${topic} start moment`,
          value: `At the moment students are about to use ${topic} and are not sure what to do first.`,
        },
        {
          label: `${topic} busy moment`,
          value: `During a busy school moment when there is not much time to ask a teacher.`,
        },
        {
          label: `${topic} check moment`,
          value: `Right before students need to confirm whether their ${topic} choice is correct.`,
        },
      ];
    case "input":
      return [
        {
          label: `${topic} photo`,
          value: `A quick photo or visual clue connected to ${topic}.`,
        },
        {
          label: `${topic} choices`,
          value: `Two or three simple choices about what is happening in ${topic}.`,
        },
        {
          label: `${topic} note`,
          value: `One short note describing the student's ${topic} situation.`,
        },
      ];
    case "aiAction":
      return [
        {
          label: `${topic} classify`,
          value: `Classify the ${topic} situation and explain the best next step.`,
        },
        {
          label: `${topic} recommend`,
          value: `Recommend one useful action for ${topic} with a short reason.`,
        },
        {
          label: `${topic} plan`,
          value: `Generate a short ${topic} plan the student can follow immediately.`,
        },
      ];
    case "output":
      return [
        {
          label: `${topic} answer card`,
          value: `A clear ${topic} answer card with one reason and a next-step button.`,
        },
        {
          label: `${topic} checklist`,
          value: `A short ${topic} checklist with the next three actions.`,
        },
        {
          label: `${topic} confidence note`,
          value: `A recommendation for ${topic} with a confidence level and human-check reminder.`,
        },
      ];
    case "impact":
      return [
        {
          label: `${topic} faster`,
          value: `Students make the ${topic} decision faster and need fewer repeated reminders.`,
        },
        {
          label: `${topic} calmer`,
          value: `Students feel calmer because the next ${topic} step is visible.`,
        },
        {
          label: `${topic} clearer`,
          value: `The class has a clearer shared way to handle ${topic}.`,
        },
      ];
    case "responsibleAiNote":
      return [
        {
          label: `${topic} teacher check`,
          value: `If the AI is unsure about ${topic}, the student should check with a teacher.`,
        },
        {
          label: `${topic} privacy`,
          value: `The prototype should not store private student information while helping with ${topic}.`,
        },
        {
          label: `${topic} explain why`,
          value: `The app should explain why it gives a ${topic} answer instead of only showing the answer.`,
        },
      ];
    default:
      return decision.prompts;
  }
}

function getBackupChoiceSet(project: StudioProject): IdeaChoiceSet {
  return builderDecisions.reduce<IdeaChoiceSet>((choices, decision) => {
    choices[decision.key] = getBackupDecisionPrompts(decision, project);
    return choices;
  }, {});
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function cleanChoiceText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

function normalizePromptList(value: unknown, fallback: BuilderPrompt[]): BuilderPrompt[] {
  if (!Array.isArray(value)) return fallback;

  const prompts = value
    .map((item) => {
      if (typeof item === "string") {
        const text = cleanChoiceText(item, 180);
        return { label: cleanChoiceText(text, 42), value: text };
      }

      if (!isRecord(item)) return null;

      const label = cleanChoiceText(item.label, 42);
      const promptValue = cleanChoiceText(item.value, 220);
      if (!label || !promptValue) return null;

      return { label, value: promptValue };
    })
    .filter((item): item is BuilderPrompt => item !== null)
    .slice(0, 3);

  return prompts.length > 0 ? prompts : fallback;
}

function normalizeIdeaChoices(payload: unknown, fallback: IdeaChoiceSet): IdeaChoiceSet {
  const source = isRecord(payload) && isRecord(payload.choices) ? payload.choices : payload;

  return builderDecisions.reduce<IdeaChoiceSet>((choices, decision) => {
    const fallbackPrompts = fallback[decision.key] ?? decision.prompts;
    choices[decision.key] = normalizePromptList(isRecord(source) ? source[decision.key] : undefined, fallbackPrompts);
    return choices;
  }, {});
}

function getIdeaChoicesEndpoint(): string {
  const configuredEndpoint = import.meta.env.VITE_IDEA_CHOICES_ENDPOINT?.trim() ?? "";
  if (configuredEndpoint) return configuredEndpoint;

  return import.meta.env.PROD ? DEFAULT_PRODUCTION_IDEA_CHOICES_ENDPOINT : "";
}

async function generateIdeaChoices(project: StudioProject): Promise<IdeaChoiceResult> {
  const fallback = getBackupChoiceSet(project);
  const endpoint = getIdeaChoicesEndpoint();

  if (!endpoint) {
    return { choices: fallback, source: "backup" };
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: project.title,
        seedIdea: project.seedIdea,
        audience: "Grade 6 students building a paper-first AI app prototype",
        decisions: builderDecisions.map(({ key, label, question, placeholder }) => ({
          key,
          label,
          question,
          placeholder,
          choicesNeeded: 3,
        })),
      }),
    });

    if (!response.ok) {
      return { choices: fallback, source: "backup" };
    }

    return {
      choices: normalizeIdeaChoices(await response.json(), fallback),
      source: "model",
    };
  } catch {
    return { choices: fallback, source: "backup" };
  }
}

export function ProductCanvas({ project, onChange }: ProductCanvasProps) {
  const [activeDecisionIndex, setActiveDecisionIndex] = useState(0);
  const [ideaChoices, setIdeaChoices] = useState<IdeaChoiceSet | null>(null);
  const [choiceStatus, setChoiceStatus] = useState<ChoiceGenerationStatus>("idle");
  const seedIdeaRef = useRef<HTMLTextAreaElement>(null);
  const readiness = Object.values(getProjectReadiness(project));
  const hasBorrowedPrinciples = project.borrowedPrinciples.length > 0;
  const activeDecision = builderDecisions[activeDecisionIndex];
  const activeValue = project[activeDecision.key];
  const activePrompts = ideaChoices?.[activeDecision.key] ?? activeDecision.prompts;
  const completedDecisions = builderDecisions.filter((decision) => project[decision.key].trim()).length;
  const readyCount = readiness.filter((item) => item.ready).length;
  const activeReadinessLabel = readinessLabelByDecisionKey[activeDecision.key];
  const requiredPaperScreens = project.screens.filter((screen) => isRequiredPaperScreenId(screen.id));
  const canConfirmIdea = isUsefulTopic(project.title) || isUsefulTopic(project.seedIdea);
  const choiceStatusLabel =
    choiceStatus === "loading"
      ? "Generating choices"
      : choiceStatus === "model"
        ? "AI choices ready"
        : choiceStatus === "backup"
          ? "Backup choices ready"
          : canConfirmIdea
            ? "Ready to confirm"
            : "Add title and seed";
  const confirmButtonLabel =
    choiceStatus === "loading"
      ? "Generating choices"
      : choiceStatus === "model" || choiceStatus === "backup"
        ? "Regenerate choices"
        : "Confirm idea";

  useLayoutEffect(() => {
    resizeSeedIdeaField(seedIdeaRef.current);
  }, [project.seedIdea]);

  function resizeSeedIdeaField(field: HTMLTextAreaElement | null) {
    if (!field) return;
    field.style.height = "auto";
    field.style.height = `${field.scrollHeight}px`;
  }

  function updateField<K extends keyof StudioProject>(key: K, value: StudioProject[K]) {
    if (key === "title" || key === "seedIdea") {
      setIdeaChoices(null);
      setChoiceStatus("idle");
    }

    onChange({ ...project, [key]: value });
  }

  function updateDecision(value: string) {
    updateField(activeDecision.key, value);
  }

  function moveDecision(direction: 1 | -1) {
    setActiveDecisionIndex((current) => Math.min(Math.max(current + direction, 0), builderDecisions.length - 1));
  }

  function updateScreenSketchReference(id: StudioScreen["id"], value: string) {
    onChange({
      ...project,
      screens: project.screens.map((screen) => {
        if (screen.id !== id) return screen;
        if (!isRequiredPaperScreenId(screen.id)) {
          return { ...screen, paperSketchReference: value };
        }

        return {
          ...screen,
          ...screenDraftsById[screen.id],
          paperSketchReference: value,
        };
      }),
    });
  }

  async function handleConfirmIdea() {
    if (!canConfirmIdea || choiceStatus === "loading") return;

    setChoiceStatus("loading");
    const result = await generateIdeaChoices(project);
    setIdeaChoices(result.choices);
    setChoiceStatus(result.source === "model" ? "model" : "backup");
  }

  return (
    <section className="module-panel">
      <p className="eyebrow">Product Canvas</p>
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
              <textarea
                ref={seedIdeaRef}
                className="seed-idea-textarea"
                rows={2}
                value={project.seedIdea}
                placeholder="A small idea worth investigating"
                onChange={(event) => {
                  updateField("seedIdea", event.target.value);
                  resizeSeedIdeaField(event.currentTarget);
                }}
              />
            </label>
            <div className="idea-confirm-box">
              <button
                className="primary-button idea-confirm-button"
                type="button"
                disabled={!canConfirmIdea || choiceStatus === "loading"}
                onClick={() => {
                  void handleConfirmIdea();
                }}
              >
                {confirmButtonLabel}
              </button>
              <span className={`idea-choice-status ${choiceStatus}`} role="status" aria-live="polite">
                {choiceStatusLabel}
              </span>
            </div>
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
              {activePrompts.map((prompt) => (
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

          <section className="paper-plan-panel" aria-labelledby="paper-plan-heading">
            <div className="paper-plan-copy">
              <p className="builder-kicker">Paper-first screen list</p>
              <h3 id="paper-plan-heading">Name the paper sketches</h3>
              <p>Draw these four screens on paper, then type the page or photo reference here.</p>
            </div>
            <div className="paper-plan-grid">
              {requiredPaperScreens.map((screen, index) => (
                <label className="paper-screen-field" key={screen.id}>
                  <span>{screen.name} sketch ref</span>
                  <input
                    value={screen.paperSketchReference}
                    placeholder={`Paper ${index + 1} or photo ${String.fromCharCode(65 + index)}`}
                    onChange={(event) => updateScreenSketchReference(screen.id, event.target.value)}
                  />
                </label>
              ))}
            </div>
          </section>
        </section>
        <aside className="canvas-card compact-readiness-card" aria-label="Live project check">
          <section className="canvas-support-section">
            <div className="readiness-header">
              <h2 id="specificity-check-heading">Specificity check</h2>
              <span className="readiness-count" aria-live="polite">
                {readyCount}/{readiness.length} ready
              </span>
            </div>
            <div className="readiness-meter" aria-hidden="true">
              <span className={`readiness-meter-fill progress-${readyCount}`} />
            </div>
            <div className="specificity-example" aria-label="Specificity example">
              <span>Too vague</span>
              <strong>Help the environment</strong>
              <span>Buildable</span>
              <strong>Grade 6 lunch bins after lunch</strong>
            </div>
            <div className="readiness-list compact-readiness-list">
              {readiness.map((item) => (
                <div
                  className={`readiness-row ${item.ready ? "ready" : ""} ${item.label === activeReadinessLabel ? "active" : ""}`}
                  key={item.label}
                  aria-label={`${item.label}: ${item.ready ? "Ready" : "Needs work"}`}
                >
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
