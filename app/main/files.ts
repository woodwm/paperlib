import { BrowserWindow, app, dialog, ipcMain, screen } from "electron";
import { join } from "path";

ipcMain.on("userData", (event, arg) => {
  event.returnValue = app.getPath("userData");
});

ipcMain.handle("show-file-picker", () => {
  return dialog.showOpenDialog({
    properties: ["openFile"],
  });
});

ipcMain.handle("show-folder-picker", () => {
  return dialog.showOpenDialog({
    properties: ["openDirectory"],
  });
});

let previewWin: BrowserWindow | null = null;
ipcMain.on("preview", (event, fileURL) => {
  if (process.platform === "darwin") {
    BrowserWindow.getFocusedWindow()?.previewFile(
      fileURL.replace("file://", "")
    );
  } else {
    const { x, y } = screen.getCursorScreenPoint();
    const currentDisplay = screen.getDisplayNearestPoint({ x, y });
    const { width, height } = currentDisplay.workAreaSize;

    if (!previewWin) {
      previewWin = new BrowserWindow({
        title: "Preview window",
        width: Math.floor(height * 0.8 * 0.75),
        height: Math.floor(height * 0.8),
        minWidth: Math.floor(height * 0.8 * 0.75),
        minHeight: Math.floor(height * 0.8),
        webPreferences: {
          webSecurity: false,
          nodeIntegration: true,
          contextIsolation: false,
        },
        frame: false,
        show: false,
      });

      if (app.isPackaged) {
        previewWin.loadFile(join(__dirname, "../../index_preview.html"));
      } else {
        // 🚧 Use ['ENV_NAME'] avoid vite:define plugin
        const url = `${process.env.VITE_DEV_SERVER_URL}/index_preview.html`;

        previewWin.loadURL(url);
      }
    }

    const bounds = currentDisplay.bounds;

    const windowSize = previewWin?.getSize();
    const windowWidth = windowSize?.[0] || 0;
    const windowHeight = windowSize?.[1] || 0;

    const centerx = bounds.x + (bounds.width - windowWidth) / 2;
    const centery = bounds.y + (bounds.height - windowHeight) / 2;
    previewWin?.setPosition(parseInt(`${centerx}`), parseInt(`${centery}`));

    previewWin?.show();

    previewWin.on("blur", () => {
      previewWin?.close();
      previewWin = null;
    });

    previewWin.webContents.on("dom-ready", () => {
      previewWin?.webContents.send("preview-file", fileURL);
    });
  }
});

ipcMain.on("close-preview", () => {
  previewWin?.close();
  previewWin = null;
});
