import React from "react";
import type { FileConfig, ProcessInfo } from "../api/types";
import { isConfigured } from "./shared";

export function ProcessesPanel({
  config,
  processes,
  onCreateRule,
  onAddToCategory,
  onGoToBindings,
  onGoToRules,
}: {
  config: FileConfig;
  processes: ProcessInfo[];
  onCreateRule: (procName: string) => void;
  onAddToCategory: (procName: string) => void;
  onGoToBindings: () => void;
  onGoToRules: () => void;
}) {
  return (
    <div className="procList">
      {processes.map((p) => {
        const configured = isConfigured(p.name, config);

        return (
          <div key={`${p.name}-${p.pid}`} className="procRow">
            <div className="procMain">
              <div className="procName">{p.name}</div>
              <div className="procMeta">PID {p.pid}</div>
              {p.category?.length ? (
                <div className="procCats">In: {p.category.join(", ")}</div>
              ) : null}
            </div>

            <div className="procRight">
              <span className={configured ? "badge" : "badge badgeDim"}>
                {configured ? "Configured" : "No rule"}
              </span>

              {!configured && (
                <div className="procBtns">
                  <button
                    className="ghostBtn"
                    onClick={() => {
                      onGoToRules();
                      onCreateRule(p.name);
                    }}
                  >
                    Create rule
                  </button>
                  <button
                    className="ghostBtn"
                    onClick={() => {
                      if (Object.keys(config.categories || {}).length === 0) {
                        onGoToBindings();
                      } else {
                        onAddToCategory(p.name);
                      }
                    }}
                  >
                    Add to…
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {processes.length === 0 && (
        <div className="emptyState">No processes found.</div>
      )}
    </div>
  );
}
