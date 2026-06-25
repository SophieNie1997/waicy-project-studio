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
  feedbackState: string;
  trustSignal: string;
}

export interface BuildLog {
  moduleId: ModuleId;
  message: string;
  at: string;
}

export interface TestNote {
  message: string;
  passed: boolean;
  at: string;
}

export interface EvidencePack {
  id: string;
  title: string;
  notes: string[];
  createdAt: string;
}

export interface StudioProject {
  seedIdea: string;
  problem: string;
  user: string;
  userMoment: string;
  input: string;
  aiAction: string;
  output: string;
  impact: string;
  responsibleAiNote: string;
  screens: StudioScreen[];
  buildLog: BuildLog[];
  testNotes: TestNote[];
  evidencePacks: EvidencePack[];
}

export interface ReadinessItem {
  ready: boolean;
}
