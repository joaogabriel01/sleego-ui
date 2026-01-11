import React, { useEffect } from "react";

export function Drawer({
  open,
  title,
  children,
  footer,
  onClose,
  width = 420,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onClose: () => void;
  width?: number;
}) {
  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="drawerBackdrop" onMouseDown={onClose}>
      <div
        className="drawerPanel"
        style={{ width }}
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="drawerHeader">
          <div className="drawerTitle">{title}</div>
          <button className="ghostBtn" onClick={onClose} aria-label="Fechar">
            ✕
          </button>
        </div>

        <div className="drawerBody">{children}</div>

        {footer && <div className="drawerFooter">{footer}</div>}
      </div>
    </div>
  );
}
