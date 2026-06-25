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
      paperSketchReference: `Paper sketch for ${screen.name}`,
    }));

    expect(canUnlockCodex(project)).toBe(false);
  });

  it("keeps Codex locked until required screens have paper sketch references", () => {
    const project = createInitialProject();
    project.seedIdea = "Lunch sorting helper";
    project.problem = "Grade 6 students forget how to sort leftover lunch waste after eating.";
    project.user = "Grade 6 students at an international school";
    project.userMoment = "Right after lunch when they stand near the sorting bins";
    project.input = "A short description or photo label of the leftover item";
    project.aiAction = "Classify the leftover and recommend the correct bin";
    project.output = "A sorting recommendation with a short reason and human check reminder";
    project.responsibleAiNote = "The output is a suggestion and students should check school sorting rules.";
    project.screens = project.screens.map((screen) => ({
      ...screen,
      job: `Help the user complete ${screen.name}`,
      userAction: "Continue through the prototype",
      mainButtonLabel: "Continue",
      feedbackState: "Shows what changed after the user acts",
      trustSignal: "Includes a human review reminder",
      paperSketchReference: "",
    }));

    expect(canUnlockCodex(project)).toBe(false);
  });

  it("accepts useful Chinese project descriptions", () => {
    const project = createInitialProject();
    project.seedIdea = "午餐分类助手";
    project.problem = "六年级学生午饭后经常不知道剩饭垃圾应该如何分类处理";
    project.user = "上中国际六年级刚吃完午饭的学生";
    project.userMoment = "学生端着餐盘站在垃圾分类桶前犹豫的时候";
    project.input = "学生输入剩饭或餐具的名称";
    project.aiAction = "根据学校分类规则给出对应垃圾桶建议";
    project.output = "页面显示分类建议原因以及人工确认提醒";
    project.responsibleAiNote = "AI只是建议学生需要对照学校海报再次确认结果";
    project.screens = project.screens.map((screen, index) => ({
      ...screen,
      job: `帮助用户完成${screen.name}页面的核心任务`,
      userAction: "用户阅读内容并点击继续完成流程",
      mainButtonLabel: "继续",
      feedbackState: "页面展示用户操作之后发生的变化",
      trustSignal: "页面提醒用户需要人工检查结果",
      paperSketchReference: `图${index + 1}`,
    }));

    expect(canUnlockCodex(project)).toBe(true);
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
      paperSketchReference: `Paper sketch for ${screen.name}`,
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
      paperSketchReference: `Paper sketch for ${screen.name}`,
    }));

    expect(canUnlockCodex(project)).toBe(true);
  });
});
