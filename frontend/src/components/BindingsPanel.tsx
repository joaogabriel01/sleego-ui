import React, { useEffect, useMemo, useState } from "react";
import type { FileConfig, ProcessInfo } from "../api/types";

export function BindingsPanel({
  config,
  processes,
  onConfigChange,
  onOpenCreateBinding,
  onCreateRuleForCategory,
}: {
  config: FileConfig;
  processes: ProcessInfo[];
  onConfigChange: React.Dispatch<React.SetStateAction<FileConfig | null>>;
  onOpenCreateBinding: () => void;
  onCreateRuleForCategory: (catName: string) => void;
}) {
  const categoryNames = useMemo(
    () => Object.keys(config.categories || {}).sort(),
    [config.categories]
  );

  const [selected, setSelected] = useState<string>(categoryNames[0] ?? "");
  const [manualProc, setManualProc] = useState("");

  useEffect(() => {
    if (!selected && categoryNames.length) setSelected(categoryNames[0]);
  }, [categoryNames, selected]);

  const bound = config.categories?.[selected] ?? [];

  const suggestions = useMemo(() => {
    return Array.from(new Set(processes.map((p) => p.name))).sort();
  }, [processes]);

  const hasRuleForSelected = useMemo(() => {
    if (!selected) return true;
    return config.apps.some((a) => a.name === selected);
  }, [config.apps, selected]);

  function addProc(proc: string) {
    if (!selected) return;
    const p = proc.trim();
    if (!p) return;
    onConfigChange((prev) => {
      if (!prev) return prev;
      const categories = { ...(prev.categories || {}) };
      const set = new Set(categories[selected] || []);
      set.add(p);
      categories[selected] = Array.from(set).sort();
      return { ...prev, categories };
    });
  }

  function removeProc(proc: string) {
    if (!selected) return;
    onConfigChange((prev) => {
      if (!prev) return prev;
      const categories = { ...(prev.categories || {}) };
      categories[selected] = (categories[selected] || []).filter((x) => x !== proc);
      return { ...prev, categories };
    });
  }

  return (
    <div className="panelBody">
      <div className="rowBetween">
        <div>
          <div className="panelTitle">Bindings</div>
          <div className="panelSub">
            Define which processes belong to a logical rule (e.g. “games”).
          </div>
        </div>
        <button className="btn" onClick={onOpenCreateBinding}>
          + Create binding
        </button>
      </div>

      <div className="spacer12" />

      {categoryNames.length === 0 ? (
        <div className="emptyState">
          No bindings yet. Click <b>“Create binding”</b>.
        </div>
      ) : (
        <>
          <div className="rowBetween">
            <select
              className="select"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              {categoryNames.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {selected && !hasRuleForSelected && (
              <button className="btn" onClick={() => onCreateRuleForCategory(selected)}>
                Create rule for “{selected}”
              </button>
            )}
          </div>

          <div className="spacer12" />

          {!hasRuleForSelected && (
            <div className="warn">
              This category has no schedule rule. Create a rule with the same name.
            </div>
          )}

          <div className="spacer12" />

          <div className="label">Add process</div>
          <div className="spacer8" />

          <div className="rowBetween" style={{ gap: 10 }}>
            <input
              className="input"
              placeholder="Process name (e.g. steam)"
              value={manualProc}
              onChange={(e) => setManualProc(e.target.value)}
              list="proc-suggestions-bindings"
            />
            <datalist id="proc-suggestions-bindings">
              {suggestions.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>

            <button
              className="btnPrimary"
              onClick={() => {
                addProc(manualProc);
                setManualProc("");
              }}
            >
              Add
            </button>
          </div>

          <div className="spacer16" />

          <div className="label">Bound processes</div>
          <div className="spacer8" />

          <div className="list">
            {bound.map((p) => (
              <div key={p} className="miniRow">
                <div>{p}</div>
                <button className="ghostBtn danger" onClick={() => removeProc(p)}>
                  Remove
                </button>
              </div>
            ))}
            {bound.length === 0 && (
              <div className="emptyState">No bound processes yet.</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
