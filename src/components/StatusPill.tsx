interface StatusPillProps {
  ready: boolean;
  label: string;
}

export function StatusPill({ ready, label }: StatusPillProps) {
  return <span className={`status-pill ${ready ? "ready" : "needs-work"}`}>{label}</span>;
}
