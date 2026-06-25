import { type ScreenId, type StudioProject, type StudioScreen } from "./types";

const createScreen = (id: ScreenId, name: string): StudioScreen => ({
  id,
  name,
  job: "",
  userAction: "",
  mainButtonLabel: "",
  feedbackState: "",
  trustSignal: "",
});

export const createInitialProject = (): StudioProject => {
  return {
    seedIdea: "",
    problem: "",
    user: "",
    userMoment: "",
    input: "",
    aiAction: "",
    output: "",
    impact: "",
    responsibleAiNote: "",
    screens: [
      createScreen("start", "Start"),
      createScreen("input", "Input"),
      createScreen("ai-result", "AI Result"),
      createScreen("human-review", "Human Review"),
      createScreen("impact", "Impact"),
    ],
    buildLog: [],
    testNotes: [],
    evidencePacks: [],
  };
};
