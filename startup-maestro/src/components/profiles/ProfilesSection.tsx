import { useState } from "react";
import {
  Plus, Trash2, GripVertical, Globe, Chrome,
  ChevronDown, ChevronRight, Link,
} from "lucide-react";
import { useStore } from "../../store";
import { ChromeProfile, ProfileUrl } from "../../types";
import { Card } from "../shared/Card";
import { Button } from "../shared/Button";
import { Toggle } from "../shared/Toggle";
import { Badge } from "../shared/Badge";
import { cn, isValidUrl, normalizeUrl } from "../../utils/helpers";

let idCounter = 1000;
const uid = () => `new-${++idCounter}`;

export function ProfilesSection() {
  const config       = useStore((s) => s.config);
  const updateConfig = useStore((s) => s.updateConfig);
  const saveConfig   = useStore((s) => s.saveConfig);
  const [expanded, setExpanded] = useState<string | null>(config?.chrome_profiles[0]?.id ?? null);
  const [saving, setSaving]     = useState(false);

  if (!config) return null;

  const update = (profiles: ChromeProfile[]) =>
    updateConfig((c) => ({ ...c, chrome_profiles: profiles }));

  const addProfile = () => {
    const newProfile: ChromeProfile = {
      id: uid(),
      name: "New Profile",
      profile_directory: "Profile 3",
      urls: [],
      launch_delay_ms: 0,
      enabled: true,
      chrome_path: null,
    };
    update([...config.chrome_profiles, newProfile]);
    setExpanded(newProfile.id);
  };

  const removeProfile = (id: string) =>
    update(config.chrome_profiles.filter((p) => p.id !== id));

  const patchProfile = (id: string, patch: Partial<ChromeProfile>) =>
    update(config.chrome_profiles.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  const handleSave = async () => {
    setSaving(true);
    await saveConfig(config);
    setSaving(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">
            Chrome Profiles
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Configure browser profiles and websites to open at startup
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={addProfile}>
            Add Profile
          </Button>
          <Button variant="primary" size="sm" loading={saving} onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {config.chrome_profiles.map((profile) => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            expanded={expanded === profile.id}
            onToggleExpand={() => setExpanded(expanded === profile.id ? null : profile.id)}
            onPatch={(patch) => patchProfile(profile.id, patch)}
            onRemove={() => removeProfile(profile.id)}
          />
        ))}
        {config.chrome_profiles.length === 0 && (
          <div
            className="text-center py-16 rounded-2xl border border-dashed border-[var(--border)] text-[var(--text-muted)]"
          >
            <Chrome size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No profiles configured</p>
            <Button variant="secondary" size="sm" className="mt-4" onClick={addProfile}>
              <Plus size={14} /> Add First Profile
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileCard({
  profile, expanded, onToggleExpand, onPatch, onRemove,
}: {
  profile: ChromeProfile;
  expanded: boolean;
  onToggleExpand: () => void;
  onPatch: (p: Partial<ChromeProfile>) => void;
  onRemove: () => void;
}) {
  const addUrl = () => {
    const newUrl: ProfileUrl = {
      id: uid(), url: "https://", label: "New Tab",
      enabled: true, order: profile.urls.length,
    };
    onPatch({ urls: [...profile.urls, newUrl] });
  };

  const removeUrl = (id: string) =>
    onPatch({ urls: profile.urls.filter((u) => u.id !== id) });

  const patchUrl = (id: string, patch: Partial<ProfileUrl>) =>
    onPatch({ urls: profile.urls.map((u) => (u.id === id ? { ...u, ...patch } : u)) });

  const enabledUrlCount = profile.urls.filter((u) => u.enabled).length;

  return (
    <Card padding="none" className="overflow-hidden">
      {/* Header row */}
      <div
        className={cn(
          "flex items-center gap-3 p-4 cursor-pointer transition-colors",
          "hover:bg-[var(--bg-elevated)]",
          !profile.enabled && "opacity-60"
        )}
        onClick={onToggleExpand}
      >
        <GripVertical size={16} className="text-[var(--text-muted)] drag-handle flex-shrink-0" />
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
          style={{
            background: profile.enabled ? "var(--accent)" : "var(--bg-elevated)",
            color: profile.enabled ? "white" : "var(--text-muted)",
          }}
        >
          {profile.name[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold text-[var(--text-primary)]">
              {profile.name}
            </span>
            <Badge variant="muted">{profile.profile_directory}</Badge>
            {profile.launch_delay_ms > 0 && (
              <Badge variant="accent">+{profile.launch_delay_ms / 1000}s</Badge>
            )}
          </div>
          <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
            {enabledUrlCount} URL{enabledUrlCount !== 1 ? "s" : ""}
            {profile.urls.length > enabledUrlCount && ` (${profile.urls.length - enabledUrlCount} disabled)`}
          </div>
        </div>
        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
          <Toggle
            checked={profile.enabled}
            onChange={(v) => onPatch({ enabled: v })}
          />
          <button
            onClick={onRemove}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-400/10 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
        {expanded ? (
          <ChevronDown size={16} className="text-[var(--text-muted)] flex-shrink-0" />
        ) : (
          <ChevronRight size={16} className="text-[var(--text-muted)] flex-shrink-0" />
        )}
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-[var(--border)] p-4 flex flex-col gap-5 animate-fade-in">
          {/* Profile Settings */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] text-[var(--text-muted)] mb-1.5">Profile Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => onPatch({ name: e.target.value })}
                placeholder="e.g. Personal"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[var(--text-muted)] mb-1.5">
                Profile Directory
                <span className="text-[10px] ml-1 text-[var(--text-muted)] opacity-70">
                  (Chrome profile folder name)
                </span>
              </label>
              <input
                type="text"
                value={profile.profile_directory}
                onChange={(e) => onPatch({ profile_directory: e.target.value })}
                placeholder="e.g. Default, Profile 1"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[var(--text-muted)] mb-1.5">
                Launch Delay (seconds)
              </label>
              <input
                type="number"
                min={0}
                max={60}
                step={0.5}
                value={profile.launch_delay_ms / 1000}
                onChange={(e) =>
                  onPatch({ launch_delay_ms: parseFloat(e.target.value) * 1000 })
                }
              />
            </div>
          </div>

          {/* Custom Chrome path */}
          <div>
            <label className="block text-[11px] text-[var(--text-muted)] mb-1.5">
              Custom Chrome Path{" "}
              <span className="opacity-60">(leave blank to use global setting)</span>
            </label>
            <input
              type="text"
              value={profile.chrome_path ?? ""}
              onChange={(e) => onPatch({ chrome_path: e.target.value || null })}
              placeholder="C:\Program Files\Google\Chrome\Application\chrome.exe"
            />
          </div>

          {/* URLs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-[12px] font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
                <Globe size={13} /> Websites
              </div>
              <Button variant="ghost" size="sm" icon={<Plus size={12} />} onClick={addUrl}>
                Add URL
              </Button>
            </div>
            <div className="flex flex-col gap-1.5">
              {profile.urls.map((urlItem) => (
                <UrlRow
                  key={urlItem.id}
                  url={urlItem}
                  onPatch={(p) => patchUrl(urlItem.id, p)}
                  onRemove={() => removeUrl(urlItem.id)}
                />
              ))}
              {profile.urls.length === 0 && (
                <div className="text-[12px] text-[var(--text-muted)] py-3 text-center">
                  No URLs configured. Click "Add URL" to begin.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

function UrlRow({
  url, onPatch, onRemove,
}: {
  url: ProfileUrl;
  onPatch: (p: Partial<ProfileUrl>) => void;
  onRemove: () => void;
}) {
  const [focused, setFocused] = useState(false);
  const valid = isValidUrl(url.url);

  return (
    <div
      className={cn(
        "flex items-center gap-2 p-2 rounded-xl border transition-colors",
        url.enabled ? "border-[var(--border)]" : "border-[var(--border)] opacity-50",
        focused && "border-accent/40"
      )}
      style={{ background: "var(--bg-elevated)" }}
    >
      <GripVertical size={13} className="text-[var(--text-muted)] drag-handle flex-shrink-0" />
      <div className="flex-1 grid grid-cols-2 gap-2">
        <input
          type="text"
          value={url.label}
          onChange={(e) => onPatch({ label: e.target.value })}
          placeholder="Label"
          className="text-[12px]"
          style={{ padding: "4px 8px" }}
        />
        <div className="relative">
          <input
            type="url"
            value={url.url}
            onChange={(e) => onPatch({ url: normalizeUrl(e.target.value) })}
            placeholder="https://..."
            className={cn("text-[12px] pr-6", !valid && url.url.length > 5 && "border-rose-400/50")}
            style={{ padding: "4px 8px" }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
          {valid && (
            <Link size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-400" />
          )}
        </div>
      </div>
      <Toggle checked={url.enabled} onChange={(v) => onPatch({ enabled: v })} />
      <button
        onClick={onRemove}
        className="p-1 rounded-lg text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-400/10 transition-colors"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}
