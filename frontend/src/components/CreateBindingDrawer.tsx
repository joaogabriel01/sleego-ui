import React, { useEffect, useMemo, useState } from "react";
import type { FileConfig } from "../api/types";
import { Drawer } from "./Drawer";
import { normalizeName } from "./shared";

export function CreateBindingDrawer({
  open,
  config,
  onClose,
  onCreate,
}: {
  open: boolean;
  config: FileConfig;
  onClose: () => void;
  onCreate: (name: string) => void;
}) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (!open) return;
    setName("");
  }, [open]);

  const exists = useMemo(() => {
    const n = normalizeName(name);
    if (!n) return false;
    return Object.prototype.hasOwnProperty.call(config.categories || {}, n);
  }, [name, config.categories]);

  const canCreate = useMemo(() => {
    const n = normalizeName(name);
    if (!n) return false;
    if (exists) return false;
    return true;
  }, [name, exists]);

  return (
    <Drawer
      open={open}
      title="Create binding"
      onClose={onClose}
      footer={
        <div className="drawerFooterRow">
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btnPrimary"
            disabled={!canCreate}
            onClick={() => onCreate(normalizeName(name))}
          >
            Create
          </button>
        </div>
      }
    >
      <div className="field">
        <div className="fieldLabel">Category name (logical rule)</div>
        <input
          className="input"
          placeholder="e.g. games"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {exists && <div className="fieldHint warn">A binding with this name already exists.</div>}
        <div className="fieldHint">
          Tip: create a <b>rule</b> with the same name to define the schedule.
        </div>
      </div>
    </Drawer>
  );
}
