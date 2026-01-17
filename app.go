package main

import (
	"context"
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
	"time"

	"github.com/gen2brain/beeep"
	"github.com/joaogabriel01/sleego"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

var iconPath = "./assets/sleego.ico"

type App struct {
	ctx context.Context

	configPath string

	loader     *sleego.Loader
	monitor    *sleego.ProcessorMonitorImpl
	categoryOp sleego.CategoryOperator

	processPolicy  sleego.ProcessPolicy
	shutdownPolicy sleego.ShutdownPolicy

	running bool
	cancel  context.CancelFunc

	alerts chan string
}

func NewApp() *App {
	alerts := make(chan string, 50)

	monitor := &sleego.ProcessorMonitorImpl{}
	categoryOp := sleego.GetCategoryOperator()

	processPolicy := sleego.NewProcessPolicyImpl(monitor, categoryOp, nil, alerts)

	shutdownPolicy := sleego.NewShutdownPolicyImpl(alerts, []int{1, 2, 3})

	return &App{
		configPath:     defaultConfigPath(),
		loader:         &sleego.Loader{},
		monitor:        monitor,
		categoryOp:     categoryOp,
		processPolicy:  processPolicy,
		shutdownPolicy: shutdownPolicy,
		alerts:         alerts,
	}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

func (a *App) GetConfig() (sleego.FileConfig, error) {
	return a.loader.Load(a.configPath)
}

func (a *App) SaveConfig(cfg sleego.FileConfig) error {
	data, err := json.MarshalIndent(cfg, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(a.configPath, data, 0o644)
}

func (a *App) GetRunningProcesses() ([]sleego.ProcessInfo, error) {
	procs, err := a.monitor.GetRunningProcesses()
	if err != nil {
		return nil, err
	}

	out := make([]sleego.ProcessInfo, 0, len(procs))
	for _, p := range procs {
		info, err := p.GetInfo()
		if err != nil {
			continue
		}
		info.Category = a.categoryOp.GetCategoriesOf(info.Name)
		out = append(out, info)
	}
	return out, nil
}

func (a *App) Run() error {
	if a.running {
		return errors.New("Já está ativo")
	}

	cfg, err := a.GetConfig()
	if err != nil {
		return err
	}

	a.categoryOp.SetProcessByCategories(cfg.Categories)

	ctx, cancel := context.WithCancel(context.Background())
	a.cancel = cancel

	a.setRunning(true)

	go a.processPolicy.Apply(ctx, cfg.Apps)

	go func() {
		for msg := range a.alerts {
			runtime.EventsEmit(a.ctx, "sleego:alert", msg)
			_ = beeep.Notify("Sleego", msg, iconPath)
		}
	}()

	if cfg.Shutdown != "" {
		st, err := time.Parse("15:04", cfg.Shutdown)
		if err != nil {
			a.setRunning(false)
			cancel()
			return err
		}
		go a.shutdownPolicy.Apply(ctx, st)
	}

	return nil
}

func (a *App) Stop() error {
	if !a.running {
		return nil
	}
	if a.cancel != nil {
		a.cancel()
	}
	a.setRunning(false)
	return nil
}

func (a *App) IsRunning() bool {
	return a.running
}

func (a *App) setRunning(v bool) {
	a.running = v

	runtime.EventsEmit(a.ctx, "sleego:state", map[string]any{
		"running": v,
	})
}

func defaultConfigPath() string {
	exe, err := os.Executable()
	if err == nil {
		dir := filepath.Dir(exe)
		p := filepath.Join(dir, "config.json")
		if fileExists(p) {
			return p
		}
	}
	return "./config.json"
}

func fileExists(p string) bool {
	_, err := os.Stat(p)
	return err == nil
}
