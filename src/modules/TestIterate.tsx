import { Field } from "../components/Field";
import type { StudioProject, TestNote } from "../domain/types";

interface TestIterateProps {
  project: StudioProject;
  onChange: (project: StudioProject) => void;
}

const emptyNote: TestNote = {
  id: "test-1",
  tester: "",
  task: "",
  pausePoint: "",
  confusion: "",
  whatWorked: "",
  chosenImprovement: "",
};

export function TestIterate({ project, onChange }: TestIterateProps) {
  const note = project.testNotes[0] || emptyNote;

  function updateNote(patch: Partial<TestNote>) {
    onChange({ ...project, testNotes: [{ ...note, ...patch }] });
  }

  return (
    <section className="module-panel">
      <p className="eyebrow">Test & Iterate</p>
      <h1>Test before polishing.</h1>
      <p className="lede">Watch someone use v1, then choose one meaningful improvement for v2.</p>
      <div className="form-grid">
        <Field label="Tester" value={note.tester} onChange={(value) => updateNote({ tester: value })} placeholder="Peer tester" />
        <Field
          label="Tester task"
          value={note.task}
          onChange={(value) => updateNote({ task: value })}
          placeholder="Try to complete the main flow without explanation"
        />
        <Field
          label="Where did they pause?"
          value={note.pausePoint}
          onChange={(value) => updateNote({ pausePoint: value })}
          placeholder="Screen or moment"
        />
        <Field
          label="What was confusing?"
          value={note.confusion}
          onChange={(value) => updateNote({ confusion: value })}
          placeholder="Button, wording, result, next step, trust"
          multiline
        />
        <Field
          label="What worked well?"
          value={note.whatWorked}
          onChange={(value) => updateNote({ whatWorked: value })}
          placeholder="Something clear, useful, or interesting"
          multiline
        />
        <Field
          label="Chosen v2 improvement"
          value={note.chosenImprovement}
          onChange={(value) => updateNote({ chosenImprovement: value })}
          placeholder="One real change based on testing"
          multiline
        />
      </div>
    </section>
  );
}
