import { app as i, ipcMain as a, desktopCapturer as d, BrowserWindow as l, screen as u } from "electron";
import { fileURLToPath as g } from "node:url";
import o from "node:path";
const c = o.dirname(g(import.meta.url));
process.env.APP_ROOT = o.join(c, "..");
const p = process.env.VITE_DEV_SERVER_URL, v = o.join(process.env.APP_ROOT, "dist-electron"), f = o.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = p ? o.join(process.env.APP_ROOT, "public") : f;
let n, e, r;
function m() {
  const { width: t, height: s } = u.getPrimaryDisplay().workAreaSize;
  n = new l({
    width: 300,
    height: 310,
    minHeight: 50,
    minWidth: 50,
    maxHeight: 300,
    maxWidth: 320,
    x: 10,
    y: 10,
    transparent: !0,
    frame: !1,
    hasShadow: !0,
    alwaysOnTop: !0,
    focusable: !0,
    icon: o.join(process.env.VITE_PUBLIC, "palu-logo.svg"),
    webPreferences: {
      nodeIntegration: !1,
      // don't allow direct Node.js in renderer
      contextIsolation: !0,
      // very important for security
      // devTools: true,
      preload: o.join(c, "preload.mjs")
    }
  }), e = new l({
    width: 150,
    height: 60,
    minHeight: 60,
    maxHeight: 60,
    minWidth: 150,
    maxWidth: 150,
    x: t / 2 - 75,
    y: s - 70,
    frame: !1,
    transparent: !0,
    alwaysOnTop: !0,
    focusable: !1,
    icon: o.join(process.env.VITE_PUBLIC, "palu-logo.svg"),
    webPreferences: {
      nodeIntegration: !1,
      contextIsolation: !0,
      // devTools: true,
      preload: o.join(c, "preload.mjs")
    }
  }), r = new l({
    width: 150,
    height: 150,
    minHeight: 70,
    maxHeight: 200,
    minWidth: 70,
    maxWidth: 200,
    x: t - 160,
    y: 10,
    frame: !1,
    transparent: !0,
    alwaysOnTop: !0,
    focusable: !1,
    icon: o.join(process.env.VITE_PUBLIC, "palu-logo.svg"),
    webPreferences: {
      nodeIntegration: !1,
      contextIsolation: !0,
      // devTools: true,
      preload: o.join(c, "preload.mjs")
    }
  }), n.setVisibleOnAllWorkspaces(!0, { visibleOnFullScreen: !0 }), n.setAlwaysOnTop(!0, "screen-saver", 1), e.setVisibleOnAllWorkspaces(!0, { visibleOnFullScreen: !0 }), e.setAlwaysOnTop(!0, "screen-saver", 1), r.setVisibleOnAllWorkspaces(!0, { visibleOnFullScreen: !0 }), r.setAlwaysOnTop(!0, "screen-saver", 1), r.setAspectRatio(1 / 1), e.setAspectRatio(5 / 2), n.webContents.on("did-finish-load", () => {
    n == null || n.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), e.webContents.on("did-finish-load", () => {
    e == null || e.webContents.send(
      "main-process-message",
      (/* @__PURE__ */ new Date()).toLocaleString()
    );
  }), i.isPackaged ? (n.loadURL("http://localhost:4173"), e.loadURL("http://localhost:4173/studio.html"), r.loadURL("http://localhost:4173/webcam.html")) : (n.loadURL(p), e.loadURL(`${p}/studio.html`), r.loadURL(`${p}/webcam.html`));
}
i.on("window-all-closed", () => {
  process.platform !== "darwin" && (i.quit(), n = null, e = null, r = null);
});
a.on("closeApp", () => {
  process.platform !== "darwin" && (i.quit(), n = null, e = null, r = null);
});
a.handle("getSources", async () => {
  try {
    const t = await d.getSources({
      thumbnailSize: { height: 100, width: 150 },
      fetchWindowIcons: !0,
      types: ["window", "screen"]
    });
    return console.log("getSources: ", t), t;
  } catch (t) {
    return console.error("Error fetching sources:", t), { error: !0, message: t };
  }
});
a.on("media-sources", (t, s) => {
  e == null || e.webContents.send("profile-recieved", s);
});
a.on("resize-studio", (t, s) => {
  s.shrink && (e == null || e.setMaximumSize(300, 120), e == null || e.setMinimumSize(200, 80), e == null || e.setSize(300, 120), e == null || e.setAspectRatio(5 / 2)), s.shrink || (e == null || e.setMaximumSize(150, 60), e == null || e.setMinimumSize(150, 60), e == null || e.setSize(150, 60));
});
a.on("hide-plugin", (t, s) => {
  n == null || n.webContents.send("profile-recieved", s);
});
a.on("debug", (t, s, h) => {
  console.log("#############  Debug Request from ", s), console.log("Event Name: ", t.sender.id), console.log("payload: ", h);
});
i.on("activate", () => {
  l.getAllWindows().length === 0 && m();
});
i.on("ready", () => setTimeout(m, 300));
export {
  v as MAIN_DIST,
  f as RENDERER_DIST,
  p as VITE_DEV_SERVER_URL
};
