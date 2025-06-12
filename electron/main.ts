import { app, BrowserWindow, desktopCapturer, ipcMain, screen } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, "..");

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let win: BrowserWindow | null;
let studio: BrowserWindow | null;
let floatingWebCam: BrowserWindow | null;

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  // window for screen device config etc
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
      nodeIntegration: false, // don't allow direct Node.js in renderer
      contextIsolation: true, // very important for security
      // devTools: true,
      preload: path.join(__dirname, "preload.mjs"),
    },
  });
  // win.webContents.openDevTools()

  // window for record, stop etc button (studio tray)
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
      preload: path.join(__dirname, "preload.mjs"),
    },
  });

  // window for webcam
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
      preload: path.join(__dirname, "preload.mjs"),
    },
  });

  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  win.setAlwaysOnTop(true, "screen-saver", 1);
  studio.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  studio.setAlwaysOnTop(true, "screen-saver", 1);
  floatingWebCam.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  floatingWebCam.setAlwaysOnTop(true, "screen-saver", 1);

  floatingWebCam.setAspectRatio(1 / 1);
  studio.setAspectRatio(5 / 2);

  // Test active push message to Renderer-process.
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  studio.webContents.on("did-finish-load", () => {
    studio?.webContents.send(
      "main-process-message",
      new Date().toLocaleString()
    );
  });

  if (!app.isPackaged) {
    win.loadURL(VITE_DEV_SERVER_URL);
    studio.loadURL(`${VITE_DEV_SERVER_URL}/studio.html`);
    floatingWebCam.loadURL(`${VITE_DEV_SERVER_URL}/webcam.html`);
  } else {
    win.loadURL(`${import.meta.env.VITE_APP_URL}`);
    studio.loadURL(`${import.meta.env.VITE_APP_URL}/studio.html`);
    floatingWebCam.loadURL(`${import.meta.env.VITE_APP_URL}/webcam.html`);
    // win.loadFile('dist/index.html')
    // win.loadFile(path.join(RENDERER_DIST, "index.html"));
    // studio.loadFile(path.join(RENDERER_DIST, "studio.html"));
    // floatingWebCam.loadFile(path.join(RENDERER_DIST, "webcam.html"));
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
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
      types: ["window", "screen"],
    });
    console.log("getSources: ", sources);
    return sources;
  } catch (e) {
    console.error("Error fetching sources:", e);
    return { error: true, message: e };
  }
});

ipcMain.on("media-sources", (_, payload) => {
  // console.log("media-sources: ", event);

  // Sends the payload to a different window ("studio" window)
  studio?.webContents.send("profile-recieved", payload);
});

ipcMain.on("resize-studio", (_, payload) => {
  // console.log("resize-studio: ", event);
  if (payload.shrink) {
    studio?.setMaximumSize(300, 120);
    studio?.setMinimumSize(200, 80);
    studio?.setSize(300, 120);
    studio?.setAspectRatio(5 / 2);
  }
  if (!payload.shrink) {
    studio?.setMaximumSize(150, 60);
    studio?.setMinimumSize(150, 60);
    studio?.setSize(150, 60);
  }
});

ipcMain.on("hide-plugin", (_, payload) => {
  // console.log("hide-plugin: ", event);
  win?.webContents.send("profile-recieved", payload);
});

// debugging ipc for renderers
ipcMain.on("debug", (event, redererName, payload) => {
  console.log("#############  Debug Request from ", redererName);
  console.log("Event Name: ", event.sender.id);
  console.log("payload: ", payload);
})

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on("ready", () => setTimeout(createWindow, 300));
