import { Icon, type IconName } from "./Icon";

export type Tab = "home" | "run" | "history";

const TABS: { id: Tab; icon: IconName; label: string }[] = [
  { id: "home", icon: "whistle", label: "Coach" },
  { id: "run", icon: "runner", label: "Run" },
  { id: "history", icon: "chart", label: "History" },
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
          <Icon name={icon} size={22} />
          {label}
        </button>
      ))}
    </nav>
  );
}
