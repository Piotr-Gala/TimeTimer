const { app, BrowserWindow } = require("electron");

function createWindow() {
  const win = new BrowserWindow({
    width: 260,
    height: 360,
    alwaysOnTop: true,
    resizable: false,
    autoHideMenuBar: true,
    backgroundColor: "#eef8f9",
    webPreferences: {
      contextIsolation: true,
    },
  });

  win.setMenu(null);
  win.loadFile("index.html");
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
