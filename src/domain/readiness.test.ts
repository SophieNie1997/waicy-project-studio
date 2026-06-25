import { describe, expect, it } from "vitest";
import { createInitialProject } from "./initialProject";
import { getProjectReadiness, canUnlockCodex } from "./readiness";

describe("readiness checks", () => {
  it("keeps Codex locked when a required screen button label is whitespace-only", () => {
    const project = createInitialProject();
    project.seedIdea = "Lunch sorting helper";
    project.problem = "Grade 6 students forget how to sort leftover lunch waste after eating.";
    project.user = "Grade 6 students at an international school";
    project.userMoment = "Right after lunch when they stand near the sorting bins";
    project.input = "A short description or photo label of the leftover item";
    project.aiAction = "Classify the leftover and recommend the correct bin";
    project.output = "A sorting recommendation with a short reason and human check reminder";
    project.impact = "Students waste less food and sort leftovers more accurately";
    project.responsibleAiNote = "The output is a suggestion and students should check school sorting rules.";
    project.screens = project.screens.map((screen) => ({
      ...screen,
      job: `Help the user complete ${screen.name}`,
      userAction: "Continue through the prototype",
      mainButtonLabel: "   ",
      feedbackState: "Shows what changed after the user acts",
      trustSignal: "Includes a human review reminder",
    }));

    expect(canUnlockCodex(project)).toBe(false);
  });

  it("keeps Codex locked for a vague project", () => {
    const project = createInitialProject();
    project.seedIdea = "An AI app to help the environment";
    project.problem = "Pollution";
    project.user = "Everyone";
    project.aiAction = "Help";
    project.output = "Advice";

    const readiness = getProjectReadiness(project);

    expect(readiness.specificUser.ready).toBe(false);
    expect(readiness.showableOutput.ready).toBe(false);
    expect(canUnlockCodex(project)).toBe(false);
  });

  it("unlocks Codex when minimum v1 flow screens are complete and Impact is blank", () => {
    const project = createInitialProject();
    project.seedIdea = "Lunch sorting helper";
    project.problem = "Grade 6 students forget how to sort leftover lunch waste after eating.";
    project.user = "Grade 6 students at an international school";
    project.userMoment = "Right after lunch when they stand near the sorting bins";
    project.input = "A short description or photo label of the leftover item";
    project.aiAction = "Classify the leftover and recommend the correct bin";
    project.output = "A sorting recommendation with a short reason and human check reminder";
    project.impact = "";
    project.responsibleAiNote = "The output is a suggestion and students should check school sorting rules.";
    project.screens = project.screens.map((screen) => ({
      ...screen,
      job: `Help the user complete ${screen.name}`,
      userAction: "Continue through the prototype",
      mainButtonLabel: "Continue",
      feedbackState: "Shows what changed after the user acts",
      trustSignal: "Includes a human review reminder",
    }));

    expect(canUnlockCodex(project)).toBe(true);
  });

  it("unlocks Codex only after product canvas and required screens are ready", () => {
    const project = createInitialProject();
    project.seedIdea = "Lunch sorting helper";
    project.problem = "Grade 6 students forget how to sort leftover lunch waste after eating.";
    project.user = "Grade 6 students at an international school";
    project.userMoment = "Right after lunch when they stand near the sorting bins";
    project.input = "A short description or photo label of the leftover item";
    project.aiAction = "Classify the leftover and recommend the correct bin";
    project.output = "A sorting recommendation with a short reason and human check reminder";
    project.impact = "Students waste less food and sort leftovers more accurately";
    project.responsibleAiNote = "The output is a suggestion and students should check school sorting rules.";
    project.screens = project.screens.map((screen) => ({
      ...screen,
      job: `Help the user complete ${screen.name}`,
      userAction: "Continue through the prototype",
      mainButtonLabel: "Continue",
      feedbackState: "Shows what changed after the user acts",
      trustSignal: "Includes a human review reminder",
    }));

    expect(canUnlockCodex(project)).toBe(true);
  });
});
