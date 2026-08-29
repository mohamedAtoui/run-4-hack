export type Tab = "home" | "run" | "history";

const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: "home", icon: "🏠", label: "Coach" },
  { id: "run", icon: "🏃", label: "Run" },
  { id: "history", icon: "📈", label: "History" },
];

export function TabBar({
  tab,
  onSelect,
}: {
  tab: Tab;
  onSelect: (tab: Tab) => void;
}) {
  return (
    <nav className="tab-bar" aria-label="Main">
      {TABS.map(({ id, icon, label }) => (
        <button
          key={id}
          type="button"
          className={`tab${tab === id ? " tab-active" : ""}`}
          aria-current={tab === id ? "page" : undefined}
          onClick={() => onSelect(id)}
        >
          <span className="tab-icon" aria-hidden="true">
            {icon}
          </span>
          {label}
        </button>
      ))}
    </nav>
  );
}
