WAILS_TAGS=webkit2_41

.PHONY: dev build doctor

dev:
	wails dev -tags $(WAILS_TAGS)

build:
	wails build -tags $(WAILS_TAGS)
	cp -f config.json build/bin/config.json || true

doctor:
	wails doctor
