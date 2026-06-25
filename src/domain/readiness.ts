import { type ReadinessItem, type StudioProject, type StudioScreen } from "./types";

export const hasUsefulText = (value: string, minimumWords = 4): boolean => {
  const trimmed = value.trim();
  const words = value
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length >= minimumWords) return true;

  const cjkCharacters = trimmed.match(/\p{Script=Han}/gu)?.length ?? 0;
  return cjkCharacters >= minimumWords * 2;
};

const hasUsefulLabel = (value: string): boolean => {
  const trimmed = value.trim();
  const cjkCharacters = trimmed.match(/\p{Script=Han}/gu)?.length ?? 0;
  return trimmed.length >= 3 || cjkCharacters >= 2;
};

const hasSketchReference = (value: string): boolean => value.trim().length >= 2;

const broadUserValues = new Set([
  "everyone",
  "all people",
  "students",
  "kids",
  "children",
  "people",
]);

export const isTooBroadUser = (user: string): boolean => {
  return broadUserValues.has(user.trim().toLowerCase());
};

const CODEX_UNLOCK_SCREEN_IDS = ["start", "input", "ai-result", "human-review"] as const;

export const screenReady = (screen: StudioScreen): boolean => {
  return (
    hasUsefulText(screen.job, 3) &&
    hasUsefulText(screen.userAction, 3) &&
    hasUsefulLabel(screen.mainButtonLabel) &&
    hasUsefulText(screen.feedbackState, 3) &&
    hasUsefulText(screen.trustSignal, 3) &&
    hasSketchReference(screen.paperSketchReference)
  );
};

const toReadinessItem = (label: string, ready: boolean, guidance: string): ReadinessItem => ({
  label,
  ready,
  guidance,
});

export const getProjectReadiness = (project: StudioProject) => {
  const readyScreens = CODEX_UNLOCK_SCREEN_IDS.every((screenId) => {
    const screen = project.screens.find((candidate) => candidate.id === screenId);
    if (!screen) {
      return false;
    }
    return screenReady(screen);
  });

  return {
    realProblem: toReadinessItem(
      "Real problem",
      hasUsefulText(project.problem, 6),
      "Write a concrete problem that happens in a real moment.",
    ),
    specificUser: toReadinessItem(
      "Specific user",
      hasUsefulText(project.user, 5) && !isTooBroadUser(project.user),
      "Name a narrow user group instead of everyone or all students.",
    ),
    userMoment: toReadinessItem(
      "User moment",
      hasUsefulText(project.userMoment, 6),
      "Describe when and where the user needs help.",
    ),
    aiAction: toReadinessItem(
      "AI action",
      hasUsefulText(project.aiAction, 5),
      "Explain what the AI does with the input.",
    ),
    showableOutput: toReadinessItem(
      "Showable output",
      hasUsefulText(project.output, 8),
      "Describe what appears on screen after the AI helps.",
    ),
    responsibleAi: toReadinessItem(
      "Responsible AI",
      hasUsefulText(project.responsibleAiNote, 8),
      "Add a human review, privacy, or safety reminder.",
    ),
    requiredScreens: toReadinessItem(
      "Paper-first screen list",
      readyScreens,
      "Complete Start, Input, AI Result, Human Review, and paper sketch references before using Codex.",
    ),
  };
};

export const canUnlockCodex = (project: StudioProject): boolean => {
  const readiness = getProjectReadiness(project);

  return Object.values(readiness).every((item) => item.ready);
};
