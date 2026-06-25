interface MissionBannerProps {
  kicker?: string;
  title: string;
  detail: string;
  progress?: string;
}

export function MissionBanner({ kicker = "Today's mission", title, detail, progress }: MissionBannerProps) {
  return (
    <aside className="mission-banner" aria-label={kicker}>
      <div>
        <p className="mission-kicker">{kicker}</p>
        <p className="mission-title">{title}</p>
        <p className="mission-detail">{detail}</p>
      </div>
      {progress ? <span className="mission-progress">{progress}</span> : null}
    </aside>
  );
}
