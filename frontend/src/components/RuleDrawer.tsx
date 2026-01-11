import React, { useEffect, useMemo, useState } from "react";
import type { AppConfig, FileConfig } from "../api/types";
import { Drawer } from "./Drawer";
import { isValidTimeHHMM, normalizeName } from "./shared";

export function RuleDrawer({
  open,
  mode,
  initialRule,
  config,
  runningProcessNames,
  onClose,
  onSave,
}: {
  open: boolean;
  mode: "create" | "edit";
  initialRule?: AppConfig;
  config: FileConfig;
  runningProcessNames: string[];
  onClose: () => void;
  onSave: (rule: AppConfig, opts: { useAsCategory: boolean; oldName?: string }) => void;
}) {
  const cats = config.categories || {};

  const [name, setName] = useState(initialRule?.name ?? "");
  const [from, setFrom] = useState(initialRule?.allowed_from ?? "09:00");
  const [to, setTo] = useState(initialRule?.allowed_to ?? "18:00");

  const initialIsCategory = useMemo(() => {
    const n = initialRule?.name ?? "";
    return n ? Object.prototype.hasOwnProperty.call(cats, n) : false;
  }, [cats, initialRule?.name]);

  const [useAsCategory, setUseAsCategory] = useState(initialIsCategory);

  useEffect(() => {
    if (!open) return;
    setName(initialRule?.name ?? "");
    setFrom(initialRule?.allowed_from ?? "09:00");
    setTo(initialRule?.allowed_to ?? "18:00");
    setUseAsCategory(initialIsCategory);
  }, [open, initialRule, initialIsCategory]);

  const oldName = initialRule?.name;

  const nameTaken = useMemo(() => {
    const n = normalizeName(name);
    if (!n) return false;
    return config.apps.some((a) => a.name === n && a.name !== oldName);
  }, [name, config.apps, oldName]);

  const canSave = useMemo(() => {
    const n = normalizeName(name);
    if (!n) return false;
    if (nameTaken) return false;
    if (!isValidTimeHHMM(from) || !isValidTimeHHMM(to)) return false;
    return true;
  }, [name, from, to, nameTaken]);

  return (
    <Drawer
      open={open}
      title={mode === "create" ? "New rule" : "Edit rule"}
      onClose={onClose}
      footer={
        <div className="drawerFooterRow">
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btnPrimary"
            disabled={!canSave}
            onClick={() => {
              const rule: AppConfig = {
                name: normalizeName(name),
                allowed_from: from.trim(),
                allowed_to: to.trim(),
              };
              onSave(rule, { useAsCategory, oldName });
            }}
          >
            Save
          </button>
        </div>
      }
    >
      <div className="field">
        <div className="fieldLabel">Name</div>
        <input
          className="input"
          placeholder="e.g. code, games"
          value={name}
          onChange={(e) => setName(e.target.value)}
          list="proc-suggestions"
          disabled={mode === "edit"}
        />
        <datalist id="proc-suggestions">
          {runningProcessNames.map((p) => (
            <option key={p} value={p} />
          ))}
        </datalist>

        {nameTaken && <div className="fieldHint warn">A rule with this name already exists.</div>}
        {mode === "edit" && (
          <div className="fieldHint">
            Renaming is disabled to avoid inconsistencies with bindings.
          </div>
        )}
      </div>

      <div className="grid2">
        <div className="field">
          <div className="fieldLabel">Allowed from</div>
          <input className="input" value={from} onChange={(e) => setFrom(e.target.value)} placeholder="HH:MM" />
          {!isValidTimeHHMM(from) && <div className="fieldHint warn">Expected format: HH:MM</div>}
        </div>

        <div className="field">
          <div className="fieldLabel">To</div>
          <input className="input" value={to} onChange={(e) => setTo(e.target.value)} placeholder="HH:MM" />
          {!isValidTimeHHMM(to) && <div className="fieldHint warn">Expected format: HH:MM</div>}
        </div>
      </div>

      <div className="spacer12" />

      <label className="checkRow">
        <input
          type="checkbox"
          checked={useAsCategory}
          onChange={(e) => setUseAsCategory(e.target.checked)}
        />
        <span>Use as category (control multiple processes)</span>
      </label>

      <div className="fieldHint">
        If enabled, you can bind processes in the <b>Bindings</b> tab.
      </div>

      {useAsCategory && (
        <div className="spacer12" />
      )}
    </Drawer>
  );
}
