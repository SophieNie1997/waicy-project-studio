import { type ReadinessItem, type StudioProject, type StudioScreen } from "./types";

export const hasUsefulText = (value: string, minimumWords = 4): boolean => {
  const words = value
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return words.length >= minimumWords;
};

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
    screen.mainButtonLabel.trim().length >= 3 &&
    hasUsefulText(screen.feedbackState, 3) &&
    hasUsefulText(screen.trustSignal, 3)
  );
};

const toReadinessItem = (ready: boolean): ReadinessItem => ({ ready });

export const getProjectReadiness = (project: StudioProject) => {
  const readyScreens = CODEX_UNLOCK_SCREEN_IDS.every((screenId) => {
    const screen = project.screens.find((candidate) => candidate.id === screenId);
    if (!screen) {
      return false;
    }
    return screenReady(screen);
  });

  return {
    realProblem: toReadinessItem(hasUsefulText(project.problem, 6)),
    specificUser: toReadinessItem(hasUsefulText(project.user, 5) && !isTooBroadUser(project.user)),
    userMoment: toReadinessItem(hasUsefulText(project.userMoment, 6)),
    aiAction: toReadinessItem(hasUsefulText(project.aiAction, 5)),
    showableOutput: toReadinessItem(hasUsefulText(project.output, 8)),
    responsibleAi: toReadinessItem(hasUsefulText(project.responsibleAiNote, 8)),
    requiredScreens: toReadinessItem(readyScreens),
  };
};

export const canUnlockCodex = (project: StudioProject): boolean => {
  const readiness = getProjectReadiness(project);

  return Object.values(readiness).every((item) => item.ready);
};
