WAILS_TAGS=webkit2_41

dev:
	wails dev -tags $(WAILS_TAGS)

build:
	wails build -tags $(WAILS_TAGS)

doctor:
	wails doctor
