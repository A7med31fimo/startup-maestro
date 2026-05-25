import {
  LayoutDashboard,
  Chrome,
  AppWindow,
  ScrollText,
  Settings,
  Minimize2,
  Zap,
} from "lucide-react";
import { useStore } from "../../store";
import { NavSection } from "../../types";
import { cn } from "../../utils/helpers";

const navItems: { id: NavSection; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "Dashboard",  icon: <LayoutDashboard size={18} /> },
  { id: "profiles",  label: "Profiles",   icon: <Chrome size={18} /> },
  { id: "apps",      label: "Apps",       icon: <AppWindow size={18} /> },
  { id: "logs",      label: "Logs",       icon: <ScrollText size={18} /> },
  { id: "settings",  label: "Settings",   icon: <Settings size={18} /> },
];

export function Sidebar() {
  const activeSection = useStore((s) => s.activeSection);
  const setActiveSection = useStore((s) => s.setActiveSection);
  const config = useStore((s) => s.config);

  const handleMinimize = async () => {
    try {
      const { api } = await import("../../utils/api");
      await api.minimizeToTray();
    } catch {}
  };

  return (
    <aside
      className="w-[200px] flex-shrink-0 flex flex-col border-r border-[var(--border)]"
      style={{ background: "var(--bg-secondary)" }}
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[var(--border)]">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "var(--accent)", boxShadow: "0 0 16px var(--accent-glow)" }}
          >
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <div className="font-display text-[13px] font-bold text-[var(--text-primary)] leading-none">
              Startup
            </div>
            <div className="font-display text-[13px] font-bold text-[var(--text-secondary)] leading-none">
              Maestro
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5">
        {navItems.map((item) => {
          const active = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150",
                active
                  ? "bg-accent/15 text-accent-glow font-medium"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]"
              )}
            >
              <span className={active ? "text-accent-glow" : ""}>{item.icon}</span>
              <span className="text-[13px]">{item.label}</span>
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-glow" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-2 pb-3 flex flex-col gap-1 border-t border-[var(--border)] pt-3">
        <div className="px-3 py-2">
          <div className="text-[11px] text-[var(--text-muted)] mb-0.5">Auto-start</div>
          <div className="flex items-center gap-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: config?.settings.auto_start_with_windows
                  ? "var(--success)"
                  : "var(--text-muted)",
              }}
            />
            <span className="text-[11px] text-[var(--text-secondary)]">
              {config?.settings.auto_start_with_windows ? "Enabled" : "Disabled"}
            </span>
          </div>
        </div>
        <button
          onClick={handleMinimize}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-card)] transition-all"
        >
          <Minimize2 size={15} />
          <span className="text-[12px]">Minimize to tray</span>
        </button>
      </div>
    </aside>
  );
}
