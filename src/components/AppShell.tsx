import type { ReactNode } from "react";
import type { ModuleId, StudioProject } from "../domain/types";
import { ModuleNav } from "./ModuleNav";
import { TeacherPanel } from "./TeacherPanel";

interface AppShellProps {
  activeModule: ModuleId;
  project: StudioProject;
  children: ReactNode;
  onModuleChange: (module: ModuleId) => void;
  onExport: () => void;
  onImport: (file: File) => void;
}

export function AppShell({ activeModule, project, children, onModuleChange, onExport, onImport }: AppShellProps) {
  return (
    <div className="studio-shell">
      <ModuleNav active={activeModule} onChange={onModuleChange} />
      <main className="workspace">{children}</main>
      <TeacherPanel project={project} onExport={onExport} onImport={onImport} />
    </div>
  );
}
