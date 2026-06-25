export type ModuleId =
  | "design-gallery"
  | "product-canvas"
  | "ui-sketch-lab"
  | "codex-build-desk"
  | "test-iterate"
  | "evidence-pack";

export type ScreenId = "start" | "input" | "ai-result" | "human-review" | "impact";

export interface StudioScreen {
  id: ScreenId;
  name: string;
  job: string;
  userAction: string;
  mainButtonLabel: string;
  inputNeeded: string;
  outputShown: string;
  feedbackState: string;
  trustSignal: string;
  paperSketchReference: string;
}

export interface BuildLog {
  version: string;
  prompt: string;
  prototypeLink: string;
  screenshotsNeeded: string[];
  teacherNotes: string;
  openQuestions: string[];
}

export interface TestNote {
  id: string;
  tester: string;
  task: string;
  pausePoint: string;
  confusion: string;
  whatWorked: string;
  chosenImprovement: string;
}

export interface EvidencePack {
  whatNotes: string;
  whyNotes: string;
  howNotes: string;
  impactNotes: string;
  prototypeFlow: string;
  screenshotList: string[];
  beforeAfterComparison: string;
  testingNotes: string;
  responsibleAiStatement: string;
  futurePotential: string;
  pdfOutline: string;
  videoScriptOutline: string;
}

export interface StudioProject {
  title: string;
  seedIdea: string;
  oneSentenceFormula: string;
  problem: string;
  user: string;
  userMoment: string;
  input: string;
  aiAction: string;
  output: string;
  impact: string;
  responsibleAiNote: string;
  borrowedPrinciples: string[];
  screens: StudioScreen[];
  buildLogs: BuildLog[];
  testNotes: TestNote[];
  evidencePack: EvidencePack;
}

export interface ReadinessItem {
  label: string;
  ready: boolean;
  guidance: string;
}
