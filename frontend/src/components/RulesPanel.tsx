import React, { useMemo, useState } from "react";
import type { AppConfig, FileConfig } from "../api/types";
import { isCategoryRule } from "./shared";

export function RulesPanel({
  config,
  onCreate,
  onEdit,
  onRemove,
}: {
  config: FileConfig;
  onCreate: () => void;
  onEdit: (rule: AppConfig) => void;
  onRemove: (name: string) => void;
}) {
  const [query, setQuery] = useState("");

  const rules = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (config.apps || [])
      .filter((r) => (q ? r.name.toLowerCase().includes(q) : true))
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [config.apps, query]);

  return (
    <div className="panelBody">
      <div className="rowBetween">
        <div>
          <div className="panelTitle">Rules</div>
          <div className="panelSub">
            You set the hours. Sleego just helps you stick to them.
          </div>
        </div>
        <button className="btnPrimary" onClick={onCreate}>
          + New rule
        </button>
      </div>

      <div className="spacer12" />

      <input
        className="input"
        placeholder="Filter rules…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="spacer12" />

      <div className="list">
        {rules.map((r) => {
          const cat = isCategoryRule(r.name, config);
          const count = cat ? (config.categories?.[r.name]?.length ?? 0) : 0;

          return (
            <div key={r.name} className="card">
              <div className="cardMain">
                <div className="cardTitleRow">
                  <div className="cardTitle">{r.name}</div>
                  <span className={cat ? "badge" : "badge badgeDim"}>
                    {cat ? "Category" : "App"}
                  </span>
                </div>

                <div className="cardMeta">
                  {r.allowed_from} — {r.allowed_to}
                </div>

                <div className="cardSub">
                  {cat ? `${count} bound processes` : "Individual rule"}
                </div>
              </div>

              <div className="cardActions">
                <button className="ghostBtn" onClick={() => onEdit(r)}>
                  Edit
                </button>
                <button
                  className="ghostBtn danger"
                  onClick={() => onRemove(r.name)}
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}

        {rules.length === 0 && (
          <div className="emptyState">No rules found.</div>
        )}
      </div>
    </div>
  );
}
