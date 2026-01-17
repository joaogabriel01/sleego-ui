import React, { useEffect } from "react";

export type Toast = {
  id: string;
  title: string;
  message?: string;
};

export function ToastStack({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    if (toasts.length === 0) return;
    const last = toasts[toasts.length - 1];

    const t = window.setTimeout(() => onDismiss(last.id), 6000);
    return () => window.clearTimeout(t);
  }, [toasts, onDismiss]);

  return (
    <div className="toastHost" aria-live="polite" aria-relevant="additions">
      {toasts.map((t) => (
        <div key={t.id} className="toastCard">
          <div className="toastTitleRow">
            <div className="toastTitle">{t.title}</div>
            <button className="ghostBtn" onClick={() => onDismiss(t.id)} aria-label="Fechar">
              ✕
            </button>
          </div>
          {t.message && <div className="toastMsg">{t.message}</div>}
        </div>
      ))}
    </div>
  );
}
