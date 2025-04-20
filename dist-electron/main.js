import { app, ipcMain, desktopCapturer, BrowserWindow, screen } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
let studio;
let floatingWebCam;
function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  win = new BrowserWindow({
    width: 300,
    height: 310,
    minHeight: 50,
    minWidth: 50,
    maxHeight: 300,
    maxWidth: 320,
    x: 10,
    y: 10,
    transparent: true,
    frame: false,
    hasShadow: true,
    alwaysOnTop: true,
    focusable: true,
    icon: path.join(process.env.VITE_PUBLIC, "palu-logo.svg"),
    webPreferences: {
      nodeIntegration: false,
      // don't allow direct Node.js in renderer
      contextIsolation: true,
      // very important for security
      // devTools: true,
      preload: path.join(__dirname, "preload.mjs")
    }
  });
  studio = new BrowserWindow({
    width: 150,
    height: 60,
    minHeight: 60,
    maxHeight: 60,
    minWidth: 150,
    maxWidth: 150,
    x: width / 2 - 75,
    y: height - 70,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    focusable: false,
    icon: path.join(process.env.VITE_PUBLIC, "palu-logo.svg"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      // devTools: true,
      preload: path.join(__dirname, "preload.mjs")
    }
  });
  floatingWebCam = new BrowserWindow({
    width: 150,
    height: 150,
    minHeight: 70,
    maxHeight: 200,
    minWidth: 70,
    maxWidth: 200,
    x: width - 160,
    y: 10,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    focusable: false,
    icon: path.join(process.env.VITE_PUBLIC, "palu-logo.svg"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      // devTools: true,
      preload: path.join(__dirname, "preload.mjs")
    }
  });
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  win.setAlwaysOnTop(true, "screen-saver", 1);
  studio.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  studio.setAlwaysOnTop(true, "screen-saver", 1);
  floatingWebCam.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  floatingWebCam.setAlwaysOnTop(true, "screen-saver", 1);
  floatingWebCam.setAspectRatio(1 / 1);
  studio.setAspectRatio(5 / 2);
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  studio.webContents.on("did-finish-load", () => {
    studio == null ? void 0 : studio.webContents.send(
      "main-process-message",
      (/* @__PURE__ */ new Date()).toLocaleString()
    );
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
    studio.loadURL(`${"http://localhost:5173"}/studio.html`);
    floatingWebCam.loadURL(`${"http://localhost:5173"}/webcam.html`);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
    studio.loadFile(path.join(RENDERER_DIST, "studio.html"));
    floatingWebCam.loadFile(path.join(RENDERER_DIST, "webcam.html"));
  }
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
    studio = null;
    floatingWebCam = null;
  }
});
ipcMain.on("closeApp", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
    studio = null;
    floatingWebCam = null;
  }
});
ipcMain.handle("getSources", async () => {
  try {
    const sources = await desktopCapturer.getSources({
      thumbnailSize: { height: 100, width: 150 },
      fetchWindowIcons: true,
      types: ["window", "screen"]
    });
    console.log("getSources: ", sources);
    return sources;
  } catch (error) {
    console.error("Error fetching sources:", error);
  }
});
ipcMain.on("media-sources", (_, payload) => {
  studio == null ? void 0 : studio.webContents.send("profile-recieved", payload);
});
ipcMain.on("resize-studio", (_, payload) => {
  if (payload.shrink) {
    studio == null ? void 0 : studio.setMaximumSize(300, 120);
    studio == null ? void 0 : studio.setMinimumSize(200, 80);
    studio == null ? void 0 : studio.setSize(300, 120);
    studio == null ? void 0 : studio.setAspectRatio(5 / 2);
  }
  if (!payload.shrink) {
    studio == null ? void 0 : studio.setMaximumSize(150, 60);
    studio == null ? void 0 : studio.setMinimumSize(150, 60);
    studio == null ? void 0 : studio.setSize(150, 60);
  }
});
ipcMain.on("hide-plugin", (_, payload) => {
  win == null ? void 0 : win.webContents.send("profile-recieved", payload);
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.on("ready", () => setTimeout(createWindow, 300));
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
