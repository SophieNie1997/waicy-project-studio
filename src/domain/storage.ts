import { createInitialProject } from "./initialProject";
import type { StudioProject } from "./types";

const STORAGE_KEY = "waicy-project-studio:v1";

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const asString = (value: unknown): string => (typeof value === "string" ? value : "");
const asStringArray = (value: unknown): string[] => (Array.isArray(value) ? value.map(asString) : []);

export function saveProject(project: StudioProject): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    return true;
  } catch {
    return false;
  }
}

export function loadProject(): StudioProject {
  let raw: string | null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return createInitialProject();
  }

  if (!raw) return createInitialProject();
  try {
    return importProjectJson(raw);
  } catch {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // A failed cleanup should not block students from starting fresh.
    }
    return createInitialProject();
  }
}

export function exportProjectJson(project: StudioProject): string {
  return JSON.stringify(project, null, 2);
}

export function importProjectJson(json: string): StudioProject {
  const parsed = JSON.parse(json) as unknown;
  const fallback = createInitialProject();
  if (!isRecord(parsed)) return fallback;

  const parsedScreens = Array.isArray(parsed.screens) ? parsed.screens : [];
  const screens =
    parsedScreens.length === fallback.screens.length
      ? fallback.screens.map((fallbackScreen, index) => {
          const candidate = parsedScreens[index];
          const screen = isRecord(candidate) ? candidate : {};
          return {
            ...fallbackScreen,
            id: fallbackScreen.id,
            name: asString(screen.name) || fallbackScreen.name,
            job: asString(screen.job),
            userAction: asString(screen.userAction),
            mainButtonLabel: asString(screen.mainButtonLabel),
            inputNeeded: asString(screen.inputNeeded),
            outputShown: asString(screen.outputShown),
            feedbackState: asString(screen.feedbackState),
            trustSignal: asString(screen.trustSignal),
            paperSketchReference: asString(screen.paperSketchReference),
          };
        })
      : fallback.screens;

  const evidencePack = isRecord(parsed.evidencePack) ? parsed.evidencePack : {};

  return {
    ...fallback,
    title: asString(parsed.title),
    seedIdea: asString(parsed.seedIdea),
    oneSentenceFormula: asString(parsed.oneSentenceFormula),
    problem: asString(parsed.problem),
    user: asString(parsed.user),
    userMoment: asString(parsed.userMoment),
    input: asString(parsed.input),
    aiAction: asString(parsed.aiAction),
    output: asString(parsed.output),
    impact: asString(parsed.impact),
    responsibleAiNote: asString(parsed.responsibleAiNote),
    borrowedPrinciples: asStringArray(parsed.borrowedPrinciples),
    screens,
    buildLogs: Array.isArray(parsed.buildLogs)
      ? parsed.buildLogs.filter(isRecord).map((item) => ({
          version: asString(item.version),
          prompt: asString(item.prompt),
          prototypeLink: asString(item.prototypeLink),
          screenshotsNeeded: asStringArray(item.screenshotsNeeded),
          teacherNotes: asString(item.teacherNotes),
          openQuestions: asStringArray(item.openQuestions),
        }))
      : [],
    testNotes: Array.isArray(parsed.testNotes)
      ? parsed.testNotes.filter(isRecord).map((item) => ({
          id: asString(item.id),
          tester: asString(item.tester),
          task: asString(item.task),
          pausePoint: asString(item.pausePoint),
          confusion: asString(item.confusion),
          whatWorked: asString(item.whatWorked),
          chosenImprovement: asString(item.chosenImprovement),
        }))
      : [],
    evidencePack: {
      ...fallback.evidencePack,
      whatNotes: asString(evidencePack.whatNotes),
      whyNotes: asString(evidencePack.whyNotes),
      howNotes: asString(evidencePack.howNotes),
      impactNotes: asString(evidencePack.impactNotes),
      prototypeFlow: asString(evidencePack.prototypeFlow),
      screenshotList: asStringArray(evidencePack.screenshotList),
      beforeAfterComparison: asString(evidencePack.beforeAfterComparison),
      testingNotes: asString(evidencePack.testingNotes),
      responsibleAiStatement: asString(evidencePack.responsibleAiStatement),
      futurePotential: asString(evidencePack.futurePotential),
      pdfOutline: asString(evidencePack.pdfOutline),
      videoScriptOutline: asString(evidencePack.videoScriptOutline),
    },
  };
}
