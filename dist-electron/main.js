import { app as l, ipcMain as i, desktopCapturer as u, BrowserWindow as a, screen as g } from "electron";
import { fileURLToPath as f } from "node:url";
import n from "node:path";
const c = n.dirname(f(import.meta.url));
process.env.APP_ROOT = n.join(c, "..");
const m = process.env.VITE_DEV_SERVER_URL, R = n.join(process.env.APP_ROOT, "dist-electron"), p = n.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = m ? n.join(process.env.APP_ROOT, "public") : p;
let t, e, r;
function h() {
  const { width: o, height: s } = g.getPrimaryDisplay().workAreaSize;
  t = new a({
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
    icon: n.join(process.env.VITE_PUBLIC, "palu-logo.svg"),
    webPreferences: {
      nodeIntegration: !1,
      // don't allow direct Node.js in renderer
      contextIsolation: !0,
      // very important for security
      // devTools: true,
      preload: n.join(c, "preload.mjs")
    }
  }), e = new a({
    width: 150,
    height: 60,
    minHeight: 60,
    maxHeight: 60,
    minWidth: 150,
    maxWidth: 150,
    x: o / 2 - 75,
    y: s - 70,
    frame: !1,
    transparent: !0,
    alwaysOnTop: !0,
    focusable: !1,
    icon: n.join(process.env.VITE_PUBLIC, "palu-logo.svg"),
    webPreferences: {
      nodeIntegration: !1,
      contextIsolation: !0,
      // devTools: true,
      preload: n.join(c, "preload.mjs")
    }
  }), r = new a({
    width: 150,
    height: 150,
    minHeight: 70,
    maxHeight: 200,
    minWidth: 70,
    maxWidth: 200,
    x: o - 160,
    y: 10,
    frame: !1,
    transparent: !0,
    alwaysOnTop: !0,
    focusable: !1,
    icon: n.join(process.env.VITE_PUBLIC, "palu-logo.svg"),
    webPreferences: {
      nodeIntegration: !1,
      contextIsolation: !0,
      // devTools: true,
      preload: n.join(c, "preload.mjs")
    }
  }), t.setVisibleOnAllWorkspaces(!0, { visibleOnFullScreen: !0 }), t.setAlwaysOnTop(!0, "screen-saver", 1), e.setVisibleOnAllWorkspaces(!0, { visibleOnFullScreen: !0 }), e.setAlwaysOnTop(!0, "screen-saver", 1), r.setVisibleOnAllWorkspaces(!0, { visibleOnFullScreen: !0 }), r.setAlwaysOnTop(!0, "screen-saver", 1), r.setAspectRatio(1 / 1), e.setAspectRatio(5 / 2), t.webContents.on("did-finish-load", () => {
    t == null || t.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), e.webContents.on("did-finish-load", () => {
    e == null || e.webContents.send(
      "main-process-message",
      (/* @__PURE__ */ new Date()).toLocaleString()
    );
  }), m ? (t.loadURL(m), e.loadURL("http://localhost:5173/studio.html"), r.loadURL("http://localhost:5173/webcam.html")) : (t.loadFile(n.join(p, "index.html")), e.loadFile(n.join(p, "studio.html")), r.loadFile(n.join(p, "webcam.html")));
}
l.on("window-all-closed", () => {
  process.platform !== "darwin" && (l.quit(), t = null, e = null, r = null);
});
i.on("closeApp", () => {
  process.platform !== "darwin" && (l.quit(), t = null, e = null, r = null);
});
i.handle("getSources", async () => {
  try {
    const o = await u.getSources({
      thumbnailSize: { height: 100, width: 150 },
      fetchWindowIcons: !0,
      types: ["window", "screen"]
    });
    return console.log("getSources: ", o), o;
  } catch (o) {
    return console.error("Error fetching sources:", o), { error: !0, message: o };
  }
});
i.on("media-sources", (o, s) => {
  e == null || e.webContents.send("profile-recieved", s);
});
i.on("resize-studio", (o, s) => {
  s.shrink && (e == null || e.setMaximumSize(300, 120), e == null || e.setMinimumSize(200, 80), e == null || e.setSize(300, 120), e == null || e.setAspectRatio(5 / 2)), s.shrink || (e == null || e.setMaximumSize(150, 60), e == null || e.setMinimumSize(150, 60), e == null || e.setSize(150, 60));
});
i.on("hide-plugin", (o, s) => {
  t == null || t.webContents.send("profile-recieved", s);
});
i.on("debug", (o, s, d) => {
  console.log("#############  Debug Request from ", s), console.log("Event Name: ", o.sender.id), console.log("payload: ", d);
});
l.on("activate", () => {
  a.getAllWindows().length === 0 && h();
});
l.on("ready", () => setTimeout(h, 300));
export {
  R as MAIN_DIST,
  p as RENDERER_DIST,
  m as VITE_DEV_SERVER_URL
};
