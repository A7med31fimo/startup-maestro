import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";
import { useStore, Toast } from "../../store";

const icons = {
  success: <CheckCircle size={16} className="text-emerald-400" />,
  error:   <XCircle size={16} className="text-rose-400" />,
  info:    <Info size={16} className="text-accent-glow" />,
  warning: <AlertTriangle size={16} className="text-amber-400" />,
};

const borders = {
  success: "border-emerald-400/20",
  error:   "border-rose-400/20",
  info:    "border-accent/20",
  warning: "border-amber-400/20",
};

function ToastItem({ toast }: { toast: Toast }) {
  const removeToast = useStore((s) => s.removeToast);
  return (
    <div
      className={`
        flex items-start gap-3 p-3 rounded-xl border
        bg-[var(--bg-elevated)] ${borders[toast.type]}
        shadow-[0_4px_20px_rgba(0,0,0,0.4)]
        animate-slide-up
        max-w-[320px] w-full
      `}
    >
      <div className="mt-0.5 flex-shrink-0">{icons[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-[var(--text-primary)]">{toast.title}</p>
        {toast.message && (
          <p className="text-[12px] text-[var(--text-secondary)] mt-0.5 truncate">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        className="text-[var(--text-muted)] hover:text-[var(--text-primary)] flex-shrink-0"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useStore((s) => s.toasts);
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 items-end pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} />
        </div>
      ))}
    </div>
  );
}
