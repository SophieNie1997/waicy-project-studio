import type { EvidencePack, StudioProject } from "./types";

export function generateEvidencePack(project: StudioProject): EvidencePack {
  const latestTest = project.testNotes[project.testNotes.length - 1];
  const improvement = latestTest?.chosenImprovement || "Choose one v1 to v2 improvement after testing.";
  const screenNames = project.screens.map((screen) => screen.name).join(" -> ");
  const screenshotList = project.screens.map((screen) => `${screen.name}: ${screen.job || "Capture this prototype screen."}`);
  const testingNotes = latestTest
    ? `${latestTest.tester} tried "${latestTest.task}". Confusion: ${latestTest.confusion}. What worked: ${latestTest.whatWorked}.`
    : "Run one peer test and record confusion, what worked, and one chosen improvement.";
  const responsibleAiStatement =
    project.responsibleAiNote || "The AI output is a suggestion. A human should review it before acting.";
  const prototypeFlow = screenNames || "Start -> Input -> AI Result -> Human Review -> Impact";
  const beforeAfterComparison = `V1 issue: ${latestTest?.confusion || "Record the clearest testing issue."} V2 improvement: ${improvement}`;
  const futurePotential = project.impact
    ? `Future potential: ${project.impact}`
    : "Future potential: explain who could benefit if the prototype became real.";

  const whatNotes = `${project.title || "This project"} helps ${project.user || "a specific user"} by showing ${project.output || "a visible AI-supported result"}.`;
  const whyNotes = `The problem is: ${project.problem || "Define the real problem"}. The important user moment is: ${project.userMoment || "Define when this happens"}.`;
  const howNotes = `The user provides ${project.input || "an input"}. The AI will ${project.aiAction || "perform a clear AI action"}. The product flow is ${prototypeFlow}. The product includes human review: ${responsibleAiStatement}`;
  const impactNotes = `Testing feedback: ${testingNotes} Expected impact: ${project.impact || "Define the impact"}. Testing improvement: ${improvement}.`;

  const pdfOutline = `# ${project.title || "WAICY Project"}

## What
${whatNotes}

Prototype screens: ${project.screens.map((screen) => screen.name).join(", ")}

Screenshot list:
${screenshotList.map((item) => `- ${item}`).join("\n")}

## Why
${whyNotes}

## How
${howNotes}

## Impact
${impactNotes}

Before and after comparison: ${beforeAfterComparison}

Responsible AI statement: ${responsibleAiStatement}

Future potential: ${futurePotential}`;

  const videoScriptOutline = `Hello, we are the designers of ${project.title || "our WAICY project"}.
This project helps ${project.user || "our target user"}.
The problem is ${project.problem || "a real problem we observed"}.
The user gives ${project.input || "an input"}.
The AI helps by ${project.aiAction || "doing a clear AI action"}.
The output is ${project.output || "a useful result"}.
After testing, we improved the product by: ${improvement}.
The responsible AI rule is: ${responsibleAiStatement}.
This project matters because ${project.impact || "it can create real impact"}.`;

  return {
    whatNotes,
    whyNotes,
    howNotes,
    impactNotes,
    prototypeFlow,
    screenshotList,
    beforeAfterComparison,
    testingNotes,
    responsibleAiStatement,
    futurePotential,
    pdfOutline,
    videoScriptOutline,
  };
}
