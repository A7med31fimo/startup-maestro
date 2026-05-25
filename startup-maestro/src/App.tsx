import { useEffect } from "react";
import { useStore } from "./store";
import { Sidebar } from "./components/shared/Sidebar";
import { Dashboard } from "./components/dashboard/Dashboard";
import { ProfilesSection } from "./components/profiles/ProfilesSection";
import { AppsSection } from "./components/apps/AppsSection";
import { LogsSection } from "./components/logs/LogsSection";
import { SettingsSection } from "./components/settings/SettingsSection";
import { ToastContainer } from "./components/shared/Toast";

export default function App() {
  const activeSection = useStore((s) => s.activeSection);
  const loadConfig    = useStore((s) => s.loadConfig);
  const loadLogs      = useStore((s) => s.loadLogs);
  const checkStartup  = useStore((s) => s.checkStartup);
  const config        = useStore((s) => s.config);

  useEffect(() => {
    loadConfig();
    loadLogs();
    checkStartup();
  }, []);

  // Apply theme from config
  useEffect(() => {
    if (!config) return;
    document.documentElement.classList.toggle("light", config.settings.theme === "light");
  }, [config?.settings.theme]);

  const sectionMap: Record<string, React.ReactNode> = {
    dashboard: <Dashboard />,
    profiles:  <ProfilesSection />,
    apps:      <AppsSection />,
    logs:      <LogsSection />,
    settings:  <SettingsSection />,
  };

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "var(--bg-primary)" }}
    >
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden" style={{ background: "var(--bg-primary)" }}>
        {config ? (
          sectionMap[activeSection] ?? <Dashboard />
        ) : (
          <LoadingScreen />
        )}
      </main>
      <ToastContainer />
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="spinner mx-auto mb-4" style={{ width: 32, height: 32, borderWidth: 3 }} />
        <p className="text-[var(--text-muted)] text-sm">Loading configuration…</p>
      </div>
    </div>
  );
}
