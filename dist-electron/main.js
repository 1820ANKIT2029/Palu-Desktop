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
    height: 350,
    minHeight: 150,
    minWidth: 200,
    x: 10,
    y: 10,
    transparent: true,
    frame: false,
    hasShadow: false,
    alwaysOnTop: true,
    focusable: true,
    icon: path.join(process.env.VITE_PUBLIC, "palu-logo.svg"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      // devTools: true,
      preload: path.join(__dirname, "preload.mjs")
    }
  });
  studio = new BrowserWindow({
    width: 200,
    height: 200,
    minHeight: 70,
    maxHeight: 200,
    minWidth: 100,
    maxWidth: 200,
    x: width / 2 - 50,
    y: height / 5 * 3,
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
    x: width * 4 / 5,
    y: height / 15,
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
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  studio.webContents.on("did-finish-load", () => {
    studio == null ? void 0 : studio.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
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
    console.log(sources);
    return sources;
  } catch (error) {
    console.error("Error fetching sources:", error);
  }
});
ipcMain.on("media-sources", (event, payload) => {
  console.log(event);
  studio == null ? void 0 : studio.webContents.send("profile-recieved", payload);
});
ipcMain.on("resize-studio", (event, payload) => {
  console.log(event);
  if (payload.shrink) {
    studio == null ? void 0 : studio.setSize(400, 100);
  }
  if (!payload.shrink) {
    studio == null ? void 0 : studio.setSize(400, 250);
  }
});
ipcMain.on("hide-plugin", (event, payload) => {
  console.log(event);
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
