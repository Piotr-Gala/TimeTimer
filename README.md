# TimeTimer

A small always-on-top visual timer built with Electron.

![TimeTimer screenshot](assets/Screenshot_01.png)

## Features

- Visual dial controlled by dragging
- Countdown up to 4 hours
- Always-on-top compact window
- Pause and reset controls
- Alarm beeps when the timer finishes

## Run the app

Use the packaged Windows app:

```text
dist/TimeTimer 1.0.0.exe
```

Or run it from the terminal for development:

Install dependencies:

```bash
npm install
```

Start the app:

```bash
npm start
```

## Build

Create a portable Windows `.exe`:

```bash
npm run build
```

The built app is saved in `dist/`.
