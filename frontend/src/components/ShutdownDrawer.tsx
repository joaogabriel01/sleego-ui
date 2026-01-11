import React, { useEffect, useMemo, useState } from "react";
import { Drawer } from "./Drawer";
import { isValidTimeHHMM } from "./shared";


export function ShutdownDrawer({
  open,
  shutdown,
  onClose,
  onSave,
}: {
  open: boolean;
  shutdown: string;
  onClose: () => void;
  onSave: (value: string) => void;
}) {
  const [enabled, setEnabled] = useState(Boolean(shutdown));
  const [value, setValue] = useState(shutdown || "23:59");

  useEffect(() => {
    if (!open) return;
    setEnabled(Boolean(shutdown));
    setValue(shutdown || "23:59");
  }, [open, shutdown]);

  const canSave = useMemo(() => {
    if (!enabled) return true;
    return isValidTimeHHMM(value);
  }, [enabled, value]);

  return (
    <Drawer
      open={open}
      title="Shutdown"
      onClose={onClose}
      footer={
        <div className="drawerFooterRow">
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btnPrimary"
            disabled={!canSave}
            onClick={() => onSave(enabled ? value.trim() : "")}
          >
            Save
          </button>
        </div>
      }
    >
      <label className="checkRow">
        <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
        <span>Enable scheduled shutdown</span>
      </label>

      <div className="spacer12" />

      <div className="field">
        <div className="fieldLabel">Time</div>
        <input
          className="input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="HH:MM"
          disabled={!enabled}
        />
        {enabled && !isValidTimeHHMM(value) && (
          <div className="fieldHint warn">Expected format: HH:MM</div>
        )}
        <div className="fieldHint">
          Sleego will warn you and shut down automatically at the set time.
        </div>
      </div>
    </Drawer>
  );
}
