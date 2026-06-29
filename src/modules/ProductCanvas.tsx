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

interface InterestMission {
  title: string;
  audience: string;
  tags: string[];
  promise: string;
  project: Pick<
    StudioProject,
    | "title"
    | "seedIdea"
    | "problem"
    | "user"
    | "userMoment"
    | "input"
    | "aiAction"
    | "output"
    | "impact"
    | "responsibleAiNote"
  >;
}

type ChoiceGenerationStatus = "idle" | "loading" | "model" | "backup";
type CanvasFlowStepId = "mission" | "builder" | "check" | "screens";

interface CanvasFlowStep {
  id: CanvasFlowStepId;
  label: string;
  stepLabel: string;
  title: string;
  detail: string;
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

type IdeaChoiceSet = Partial<Record<BuilderDecision["key"], BuilderPrompt[]>>;

interface IdeaChoiceResult {
  choices: IdeaChoiceSet;
  source: "model" | "backup";
}

const canvasFlowSteps: CanvasFlowStep[] = [
  {
    id: "mission",
    label: "Pick mission",
    stepLabel: "Step 1 of 4",
    title: "Pick your mission",
    detail: "Choose one starting point from the student's interests, or open a blank idea if they already have one.",
  },
  {
    id: "builder",
    label: "Make it specific",
    stepLabel: "Step 2 of 4",
    title: "Make it specific",
    detail: "Work on one product decision at a time so the idea becomes easy to explain.",
  },
  {
    id: "check",
    label: "Check idea",
    stepLabel: "Step 3 of 4",
    title: "Check your idea",
    detail: "Use the short teacher check only after the student has a real product draft.",
  },
  {
    id: "screens",
    label: "Draw screens",
    stepLabel: "Step 4 of 4",
    title: "Draw four screens",
    detail: "Keep the paper sketch task separate so students know exactly what to draw next.",
  },
];

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

const interestMissions: InterestMission[] = [
  {
    title: "Tennis Match Coach",
    audience: "Tennis fans",
    tags: ["tennis", "practice", "fast feedback"],
    promise: "Turn one rally problem into a tiny coach that gives the next drill.",
    project: {
      title: "Tennis Match Coach",
      seedIdea: "Help young tennis players choose one useful practice move after a tough rally.",
      problem: "Young tennis players often know they made a mistake in a rally, but they are not sure what to practice next.",
      user: "Grade 6 tennis players who just finished a practice rally and want one clear next drill.",
      userMoment: "Right after a rally or short match, before the player forgets what felt difficult.",
      input: "A short note about what happened in the rally, such as missed serve, weak backhand, or late footwork.",
      aiAction: "Classify the rally problem and recommend one practice drill with a short reason.",
      output: "A coach card with the problem label, one drill, one reason, and a confidence note.",
      impact: "Players choose a focused practice faster instead of repeating the same mistake without a plan.",
      responsibleAiNote: "The app should not judge the player as good or bad; it should explain that a coach or adult still checks technique.",
    },
  },
  {
    title: "Lego Build Rescue",
    audience: "Lego builders",
    tags: ["lego", "instructions", "visual check"],
    promise: "Help a builder recover when a step, piece, or direction gets confusing.",
    project: {
      title: "Lego Build Rescue",
      seedIdea: "Help Lego builders spot what might be missing when a build suddenly stops making sense.",
      problem: "Lego builders can get stuck when one piece is missing, flipped, or placed in the wrong direction.",
      user: "Grade 6 Lego builders following a model or custom build during a focused building session.",
      userMoment: "In the middle of a build, when the next step does not match what is on the table.",
      input: "A photo of the current build plus the step number or one sentence about what looks wrong.",
      aiAction: "Compare the build situation with the expected step and suggest the most likely next check.",
      output: "A rescue card with a likely issue, a visual check, and one next action to try.",
      impact: "Builders recover from stuck moments faster and keep building instead of giving up.",
      responsibleAiNote: "The prototype should avoid storing photos of people and should say that the AI may miss small pieces.",
    },
  },
  {
    title: "Soccer Card Scout",
    audience: "Soccer card collectors",
    tags: ["soccer", "cards", "compare"],
    promise: "Compare cards by role, stats, and collection goal instead of only hype.",
    project: {
      title: "Soccer Card Scout",
      seedIdea: "Help soccer card collectors decide which card fits their collection or trade goal.",
      problem: "Soccer card collectors can argue about cards without a clear way to compare role, stats, rarity, and personal goal.",
      user: "Grade 6 soccer card collectors deciding whether to keep, trade, or feature one card.",
      userMoment: "During a card swap or collection review, when two cards both look exciting.",
      input: "Two card names, positions, simple stats, rarity, and the collector's goal.",
      aiAction: "Compare the cards and recommend keep, trade, or feature with one reason.",
      output: "A scout report with a winner for the user's goal, two evidence points, and a fair uncertainty note.",
      impact: "Collectors make clearer choices and can explain the decision without only saying which player is famous.",
      responsibleAiNote: "The app should not pretend to know real prices unless the data source is shown and checked by a person.",
    },
  },
  {
    title: "Fair Fan Debate Coach",
    audience: "Strong sports opinions",
    tags: ["soccer", "rivalry", "respectful argument"],
    promise: "Turn an anti-player or anti-team hot take into a fair, evidence-backed argument.",
    project: {
      title: "Fair Fan Debate Coach",
      seedIdea: "Help soccer fans explain a strong dislike for a player or rival team without making it mean.",
      problem: "Sports fans often have strong anti-player or anti-team opinions, but the discussion can become unfair or personal.",
      user: "Grade 6 soccer fans who want to explain a rival opinion in a debate or card discussion.",
      userMoment: "after a friend asks why they dislike a famous player, team, or card and the conversation gets heated.",
      input: "One hot take, one reason the fan believes it, and one fact or stat they want to use.",
      aiAction: "Rewrite the hot take into a respectful argument, add evidence, and show one counterpoint.",
      output: "A debate card with claim, evidence, respectful wording, and a counterpoint to check.",
      impact: "Fans keep their personality and opinion while learning to argue with evidence and respect.",
      responsibleAiNote: "The app should block insults, separate facts from opinions, and remind users not to target real people personally.",
    },
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
  const [activeFlowStep, setActiveFlowStep] = useState<CanvasFlowStepId>(() =>
    isUsefulTopic(project.title) || isUsefulTopic(project.seedIdea) ? "builder" : "mission",
  );
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
  const activeFlow = canvasFlowSteps.find((step) => step.id === activeFlowStep) ?? canvasFlowSteps[0];
  const selectedMission = interestMissions.find((mission) => mission.project.title === project.title);
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

  function goToFlowStep(stepId: CanvasFlowStepId) {
    if ((stepId === "check" || stepId === "screens") && !canConfirmIdea) return;
    setActiveFlowStep(stepId);
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

  function applyInterestMission(mission: InterestMission) {
    setIdeaChoices(null);
    setChoiceStatus("idle");
    setActiveDecisionIndex(0);
    setActiveFlowStep("builder");
    onChange({
      ...project,
      ...mission.project,
    });
  }

  function startCustomIdea() {
    setIdeaChoices(null);
    setChoiceStatus("idle");
    setActiveDecisionIndex(0);
    setActiveFlowStep("builder");
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
      <section className="idea-builder" aria-labelledby="idea-builder-heading">
        <nav className="student-flow-nav" aria-label="Product Canvas steps">
          {canvasFlowSteps.map((step) => {
            const isActive = step.id === activeFlowStep;
            const isLocked = (step.id === "check" || step.id === "screens") && !canConfirmIdea;

            return (
              <button
                className={`student-flow-tab ${isActive ? "active" : ""}`}
                key={step.id}
                type="button"
                aria-current={isActive ? "step" : undefined}
                aria-label={step.label}
                disabled={isLocked}
                onClick={() => goToFlowStep(step.id)}
              >
                <span>{step.stepLabel.replace("Step ", "")}</span>
                <strong>{step.label}</strong>
              </button>
            );
          })}
        </nav>

        <div className="student-flow-header">
          <p className="builder-kicker">{activeFlow.stepLabel}</p>
          <h2 id="idea-builder-heading">{activeFlow.title}</h2>
          <p>{activeFlow.detail}</p>
        </div>

        <div className="student-flow-body">
          {activeFlowStep === "mission" ? (
            <section className="interest-mission-board" aria-labelledby="interest-mission-heading">
              <div className="interest-mission-copy">
                <p className="builder-kicker">Student interest seeds</p>
                <h3 id="interest-mission-heading">Start from something they already care about.</h3>
                <p>Pick one seed to get a useful draft, or start with a blank idea and shape it yourself.</p>
              </div>
              <div className="interest-mission-grid">
                {interestMissions.map((mission) => (
                  <article className="interest-mission-card" key={mission.title}>
                    <div>
                      <span className="mission-audience">{mission.audience}</span>
                      <h4>{mission.title}</h4>
                      <p>{mission.promise}</p>
                    </div>
                    <ul aria-label={`${mission.title} interest tags`}>
                      {mission.tags.map((tag) => (
                        <li key={tag}>{tag}</li>
                      ))}
                    </ul>
                    <button
                      className="secondary-button compact-action"
                      type="button"
                      onClick={() => applyInterestMission(mission)}
                    >
                      Use this seed
                    </button>
                  </article>
                ))}
                <article className="interest-mission-card custom-mission-card">
                  <div>
                    <span className="mission-audience">Own idea</span>
                    <h4>Blank product canvas</h4>
                    <p>Use this when a student already has a topic and needs a quiet place to make it specific.</p>
                  </div>
                  <ul aria-label="Blank product canvas interest tags">
                    <li>custom</li>
                    <li>student choice</li>
                    <li>paper first</li>
                  </ul>
                  <button className="secondary-button compact-action" type="button" onClick={startCustomIdea}>
                    Start custom idea
                  </button>
                </article>
              </div>
            </section>
          ) : null}

          {activeFlowStep === "builder" ? (
            <section className="builder-step" aria-label="Make project specific">
              <div className="selected-mission-strip" aria-label="Selected mission">
                <div className="selected-mission-copy">
                  <p className="builder-kicker">Selected mission</p>
                  <strong>{project.title.trim() || "Custom project"}</strong>
                  <span>{selectedMission?.promise ?? (project.seedIdea.trim() || "Start by naming the product and seed idea.")}</span>
                </div>
                <div className="selected-mission-actions">
                  <span className="builder-progress">{readyCount}/{readiness.length} ready</span>
                  <button className="secondary-button compact-action" type="button" onClick={() => setActiveFlowStep("mission")}>
                    Change mission
                  </button>
                </div>
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

              <div className="idea-builder-topline builder-step-status">
                <div>
                  <p className="builder-kicker">Decision {activeDecisionIndex + 1} of {builderDecisions.length}</p>
                  <strong>{activeDecision.label}</strong>
                </div>
                <span className="builder-progress">{completedDecisions}/{builderDecisions.length} decisions shaped</span>
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
            </section>
          ) : null}

          {activeFlowStep === "check" ? (
            <section className="check-step-grid" aria-label="Project check">
              <aside className="live-brief" aria-label="Live product brief">
                <p>Live brief</p>
                <strong>{project.title.trim() || "Untitled project"}</strong>
                <span>{buildBrief(project)}.</span>
              </aside>

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
            </section>
          ) : null}

          {activeFlowStep === "screens" ? (
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
          ) : null}
        </div>
      </section>
    </section>
  );
}
