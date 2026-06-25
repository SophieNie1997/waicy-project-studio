import { type ScreenId, type StudioProject, type StudioScreen } from "./types";

const createScreen = (id: ScreenId, name: string): StudioScreen => ({
  id,
  name,
  job: "",
  userAction: "",
  mainButtonLabel: "",
  inputNeeded: "",
  outputShown: "",
  feedbackState: "",
  trustSignal: "",
  paperSketchReference: "",
});

export const createInitialProject = (): StudioProject => {
  return {
    title: "",
    seedIdea: "",
    oneSentenceFormula: "",
    problem: "",
    user: "",
    userMoment: "",
    input: "",
    aiAction: "",
    output: "",
    impact: "",
    responsibleAiNote: "",
    borrowedPrinciples: [],
    screens: [
      createScreen("start", "Start"),
      createScreen("input", "Input"),
      createScreen("ai-result", "AI Result"),
      createScreen("human-review", "Human Review"),
      createScreen("impact", "Impact"),
    ],
    buildLogs: [],
    testNotes: [],
    evidencePack: {
      whatNotes: "",
      whyNotes: "",
      howNotes: "",
      impactNotes: "",
      prototypeFlow: "",
      screenshotList: [],
      beforeAfterComparison: "",
      testingNotes: "",
      responsibleAiStatement: "",
      futurePotential: "",
      pdfOutline: "",
      videoScriptOutline: "",
    },
  };
};
