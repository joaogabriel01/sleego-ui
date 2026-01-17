import React, { useEffect, useMemo, useState } from "react";
import { api } from "./api";
import type { AppConfig, FileConfig, ProcessInfo } from "./api/types";
import { EventsOn } from "../wailsjs/runtime/runtime";

import { IsRunning, Hide } from "../wailsjs/go/main/App";

const ico = new URL("./assets/images/sleego.ico", import.meta.url).toString();

import { ToastStack, Toast } from "./components/ToastStack";
import { RuleDrawer } from "./components/RuleDrawer";
import { ShutdownDrawer } from "./components/ShutdownDrawer";
import { BindingsPanel } from "./components/BindingsPanel";
import { RulesPanel } from "./components/RulesPanel";
import { isConfigured } from "./components/shared";
import { ProcessesPanel } from "./components/ProcessesPanel";
import { CreateBindingDrawer } from "./components/CreateBindingDrawer";

type Tab = "rules" | "bindings";

function deepEqual(a: unknown, b: unknown) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function ConfirmModal({
  open,
  title,
  body,
  primary,
  secondary,
  tertiary,
  onPrimary,
  onSecondary,
  onTertiary,
}: {
  open: boolean;
  title: string;
  body: string;
  primary: string;
  secondary?: string;
  tertiary?: string;
  onPrimary: () => void;
  onSecondary?: () => void;
  onTertiary?: () => void;
}) {
  if (!open) return null;
  return (
    <div className="modalBackdrop">
      <div className="modalCard">
        <div className="modalTitle">{title}</div>
        <div className="modalBody">{body}</div>
        <div className="modalActions">
          {tertiary && onTertiary && (
            <button className="btn" onClick={onTertiary}>
              {tertiary}
            </button>
          )}
          {secondary && onSecondary && (
            <button className="btn" onClick={onSecondary}>
              {secondary}
            </button>
          )}
          <button className="btnPrimary" onClick={onPrimary}>
            {primary}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<FileConfig | null>(null);
  const [initialConfig, setInitialConfig] = useState<FileConfig | null>(null);
  const [processes, setProcesses] = useState<ProcessInfo[]>([]);
  const [tab, setTab] = useState<Tab>("rules");
  const [procQuery, setProcQuery] = useState("");
  const [procOnlyUnconfigured, setProcOnlyUnconfigured] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [ruleDrawerOpen, setRuleDrawerOpen] = useState(false);
  const [ruleDrawerMode, setRuleDrawerMode] = useState<"create" | "edit">(
    "create"
  );
  const [ruleEditing, setRuleEditing] = useState<AppConfig | undefined>(
    undefined
  );
  const [shutdownDrawerOpen, setShutdownDrawerOpen] = useState(false);
  const [confirmRunOpen, setConfirmRunOpen] = useState(false);
  const [confirmSaveRunOpen, setConfirmSaveRunOpen] = useState(false);

  const [createBindingOpen, setCreateBindingOpen] = useState(false);

  const [toasts, setToasts] = useState<Toast[]>([]);

  async function loadAll() {
    setLoading(true);
    try {
      const [cfg, procs] = await Promise.all([
        api.getConfig(),
        api.getRunningProcesses(),
      ]);
      setConfig(cfg);
      setInitialConfig(structuredClone(cfg));
      setProcesses(procs);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAll();
  }, []);

  useEffect(() => {
  IsRunning().then(setIsRunning).catch(console.error);

  const off = EventsOn("sleego:state", (payload: { running: boolean }) => {
    setIsRunning(!!payload?.running);
  });

  return () => off();
}, []);

  const dirty = useMemo(() => {
    if (!config || !initialConfig) return false;
    return !deepEqual(config, initialConfig);
  }, [config, initialConfig]);

  const runningProcessNames = useMemo(() => {
    return Array.from(new Set(processes.map((p) => p.name))).sort();
  }, [processes]);

  const filteredProcesses = useMemo(() => {
    if (!config) return [];
    const q = procQuery.trim().toLowerCase();
    let list = processes.filter((p) =>
      q ? p.name.toLowerCase().includes(q) : true
    );
    if (procOnlyUnconfigured) {
      list = list.filter((p) => !isConfigured(p.name, config));
    }
    return list;
  }, [processes, procQuery, procOnlyUnconfigured, config]);

  async function onSave() {
    if (!config) return;
    await api.saveConfig(config);
    setInitialConfig(structuredClone(config));
    console.log("Configuration saved.");
  }

  async function onRunClick() {
    if (!config) return;

    if (dirty) {
      setConfirmSaveRunOpen(true);
      return;
    }

    if (isRunning) {
      await api.stop();
      console.log("Rules deactivated.");
      return;
    }

    setConfirmRunOpen(true);
  }

  async function runConfirmed() {
    await api.stop();
    setConfirmRunOpen(false);
    await api.run();
    console.log("Rules activated.");
  }

  async function saveAndRunConfirmed() {
    if (!config) return;
    setConfirmSaveRunOpen(false);
    await api.saveConfig(config);
    setInitialConfig(structuredClone(config));
    await api.run();
    console.log("Saved and activated.");
  }

  async function runWithoutSavingConfirmed() {
    setConfirmSaveRunOpen(false);
    await api.run();
    console.log("Activated without saving.");
  }

  function openCreateRuleDrawer(prefillName?: string) {
    setRuleDrawerMode("create");
    setRuleEditing(
      prefillName
        ? { name: prefillName, allowed_from: "09:00", allowed_to: "18:00" }
        : undefined
    );
    setRuleDrawerOpen(true);
    setTab("rules");
  }

  function openEditRuleDrawer(rule: AppConfig) {
    setRuleDrawerMode("edit");
    setRuleEditing(rule);
    setRuleDrawerOpen(true);
    setTab("rules");
  }

  function applyRuleSave(rule: AppConfig, opts: { useAsCategory: boolean }) {
    setConfig((prev) => {
      if (!prev) return prev;

      const exists = prev.apps.some((a) => a.name === rule.name);
      const apps = exists
        ? prev.apps.map((a) => (a.name === rule.name ? rule : a))
        : [...prev.apps, rule];

      const categories = { ...(prev.categories || {}) };
      if (opts.useAsCategory) {
        if (!categories[rule.name]) categories[rule.name] = [];
      }

      return { ...prev, apps, categories };
    });

    setRuleDrawerOpen(false);
  }

  function applyShutdownSave(value: string) {
    setConfig((prev) => (prev ? { ...prev, shutdown: value } : prev));
    setShutdownDrawerOpen(false);
  }

  function addProcessToCategory(_procName: string) {
    if (!config) return;
    setTab("bindings");
  }

  function pushToast(title: string, message?: string) {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, title, message }].slice(-3)); // keep only 3
  }

  function dismissToast(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  useEffect(() => {
    const off = EventsOn("sleego:alert", (msg: string) => {
      if (msg.toLowerCase().includes("shutting down")) {
        pushToast("Time to slow down", msg);
        return;
      }
      if (msg.toLowerCase().includes("killing process")) {
        pushToast("This application isn't available right now", msg);
        return;
      }
      pushToast("Warning", msg);
    });

    return () => {
      off();
    };
  }, []);

  if (loading || !config) {
    return (
      <div style={{ padding: 24, color: "rgba(255,255,255,0.75)" }}>
        Loading…
      </div>
    );
  }

  return (
    <div className="appShell">
      <header className="topBar">
        <div className="brand">
          <img src={ico} alt="Sleego Logo" height="60" />
          <div>
            <div className="brandTitle">Sleego</div>
            <div className="brandSub">Calm control of your time</div>
          </div>
        </div>

        <div className="statusArea">
          <div className="statusPill">
            <span className="statusLabel">Status</span>
            <span className="statusValue">{isRunning ? "Active" : "Inactive"}</span>
          </div>
          {dirty && <div className="dirtyHint">Unsaved changes</div>}
          <button className="ghostBtn" onClick={() => void loadAll()}>
            Reload
          </button>
        </div>
      </header>

      <main className="mainGrid">
        <section className="leftPanel">
          <div className="tabs">
            <button
              className={tab === "rules" ? "tab tabActive" : "tab"}
              onClick={() => setTab("rules")}
            >
              Rules
            </button>
            <button
              className={tab === "bindings" ? "tab tabActive" : "tab"}
              onClick={() => setTab("bindings")}
            >
              Bindings
            </button>
          </div>

          {tab === "rules" ? (
            <RulesPanel
              config={config}
              onCreate={() => openCreateRuleDrawer()}
              onEdit={(r) => openEditRuleDrawer(r)}
              onRemove={(name) => {
                setConfig((prev) => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    apps: prev.apps.filter((a) => a.name !== name),
                  };
                });
              }}
            />
          ) : (
            <BindingsPanel
              config={config}
              processes={processes}
              onConfigChange={setConfig}
              onOpenCreateBinding={() => setCreateBindingOpen(true)}
              onCreateRuleForCategory={(catName) => openCreateRuleDrawer(catName)}
            />
          )}
        </section>
        <aside className="rightPanel">
          <div className="panelHeader">
            <div>
              <div className="panelTitle">Running processes</div>
              <div className="panelSub">
                Use this to create rules more easily.
              </div>
            </div>
            <button className="ghostBtn" onClick={() => void loadAll()}>
              Refresh
            </button>
          </div>

          <div className="procControls">
            <input
              className="input"
              placeholder="Search process…"
              value={procQuery}
              onChange={(e) => setProcQuery(e.target.value)}
            />

            <label className="checkRow">
              <input
                type="checkbox"
                checked={procOnlyUnconfigured}
                onChange={(e) => setProcOnlyUnconfigured(e.target.checked)}
              />
              <span>Only unconfigured</span>
            </label>
          </div>

          <ProcessesPanel
            config={config}
            processes={filteredProcesses}
            onCreateRule={(procName) => openCreateRuleDrawer(procName)}
            onAddToCategory={(procName) => addProcessToCategory(procName)}
            onGoToBindings={() => setTab("bindings")}
            onGoToRules={() => setTab("rules")}
          />
        </aside>
      </main>

      <footer className="footerBar">
      <div className="footerLeft">
          <button
            className="btnGhost"
            onClick={() => Hide()}
          >
            Hide
          </button>
        </div>
        <div className="shutdownArea">
          <div className="label">Shutdown</div>
          <div className="value">{config.shutdown || "Disabled"}</div>
          <button
            className="ghostBtn"
            onClick={() => setShutdownDrawerOpen(true)}
          >
            Change
          </button>
        </div>

        <div className="actionsArea">
          {dirty && <div className="dirtyPill">Unsaved changes</div>}
          <button className="btn" onClick={() => void onSave()}>
            Save
          </button>
          <button className="btnPrimary" onClick={() => void onRunClick()}>
          {isRunning ? "Stop" : "Activate Rules"}
        </button>
        </div>
      </footer>

      <RuleDrawer
        open={ruleDrawerOpen}
        mode={ruleDrawerMode}
        initialRule={ruleEditing}
        config={config}
        runningProcessNames={runningProcessNames}
        onClose={() => setRuleDrawerOpen(false)}
        onSave={(rule, opts) =>
          applyRuleSave(rule, { useAsCategory: opts.useAsCategory })
        }
      />

      <ShutdownDrawer
        open={shutdownDrawerOpen}
        shutdown={config.shutdown}
        onClose={() => setShutdownDrawerOpen(false)}
        onSave={applyShutdownSave}
      />

      <CreateBindingDrawer
        open={createBindingOpen}
        config={config}
        onClose={() => setCreateBindingOpen(false)}
        onCreate={(name) => {
          setConfig((prev) => {
            if (!prev) return prev;
            const categories = { ...(prev.categories || {}) };
            categories[name] = categories[name] || [];
            return { ...prev, categories };
          });
          setCreateBindingOpen(false);
          setTab("bindings");
        }}
      />

      <ConfirmModal
        open={confirmRunOpen}
        title="Activate rules now?"
        body="I'll apply the configured schedule and warn you before any block happens."
        primary="Activate"
        secondary="Cancel"
        onPrimary={() => void runConfirmed()}
        onSecondary={() => setConfirmRunOpen(false)}
      />

      <ConfirmModal
        open={confirmSaveRunOpen}
        title="Save and activate?"
        body="You have unsaved changes. What would you like to do?"
        primary="Save and activate"
        secondary="Activate without saving"
        tertiary="Cancel"
        onPrimary={() => void saveAndRunConfirmed()}
        onSecondary={() => void runWithoutSavingConfirmed()}
        onTertiary={() => setConfirmSaveRunOpen(false)}
      />

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
