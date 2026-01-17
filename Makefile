WAILS_TAGS=webkit2_41

.PHONY: dev build install uninstall install-linux install-windows uninstall-linux uninstall-windows

dev:
	wails dev -tags $(WAILS_TAGS)

build:
	wails build -tags $(WAILS_TAGS)

install: build
	@uname | grep -qi linux && $(MAKE) install-linux || true
	@uname | grep -qi mingw && $(MAKE) install-windows || true

uninstall:
	@uname | grep -qi linux && $(MAKE) uninstall-linux || true
	@uname | grep -qi mingw && $(MAKE) uninstall-windows || true

install-linux:
	sh scripts/install-linux.sh

install-windows:
	sh scripts/install-windows.sh

uninstall-linux:
	sh scripts/uninstall-linux.sh

uninstall-windows:
	sh scripts/uninstall-windows.sh