import { app, BrowserWindow, desktopCapturer, ipcMain, screen } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null
let studio: BrowserWindow | null
let floatingWebCam: BrowserWindow | null


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
    icon: path.join(process.env.VITE_PUBLIC, 'palu-logo.svg'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      // devTools: true,
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  // win.webContents.openDevTools()

  studio = new BrowserWindow({
    width: 200,
    height: 200,
    minHeight: 70,
    maxHeight: 200,
    minWidth: 100,
    maxWidth: 200,
    x: width/2 -50,
    y: (height/5)*3,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    focusable: false,
    icon: path.join(process.env.VITE_PUBLIC, 'palu-logo.svg'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      // devTools: true,
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  floatingWebCam = new BrowserWindow({
    width: 150,
    height: 150,
    minHeight: 70,
    maxHeight: 200,
    minWidth: 70,
    maxWidth: 200,
    x: width*4/5,
    y: height/15,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    focusable: false,
    icon: path.join(process.env.VITE_PUBLIC, 'palu-logo.svg'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      // devTools: true,
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
  win.setAlwaysOnTop(true, 'screen-saver', 1)
  studio.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
  studio.setAlwaysOnTop(true, 'screen-saver', 1)
  floatingWebCam.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
  floatingWebCam.setAlwaysOnTop(true, 'screen-saver', 1)



  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  studio.webContents.on('did-finish-load', () => {
    studio?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
    studio.loadURL(`${import.meta.env.VITE_APP_URL}/studio.html`)
    floatingWebCam.loadURL(`${import.meta.env.VITE_APP_URL}/webcam.html`)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
    studio.loadFile(path.join(RENDERER_DIST, 'studio.html'))
    floatingWebCam.loadFile(path.join(RENDERER_DIST, 'webcam.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
    studio = null
    floatingWebCam = null
  }
})

ipcMain.on('closeApp', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
    studio = null
    floatingWebCam = null
  }
})

ipcMain.handle('getSources', async () => {
  try {
    const sources = await desktopCapturer.getSources({
      thumbnailSize: { height: 100, width: 150 },
      fetchWindowIcons: true,
      types: ['window', 'screen'],
    });
    console.log(sources)
    return sources;
  } catch (error) {
    console.error('Error fetching sources:', error);
  }
});

ipcMain.on('media-sources', (event, payload) => {
  console.log(event)
  studio?.webContents.send('profile-recieved', payload)
})

ipcMain.on('resize-studio', (event, payload) => {
  console.log(event)
  if(payload.shrink){
    studio?.setSize(400, 100)
  }
  if(!payload.shrink){
    studio?.setSize(400, 250)
  }
})

ipcMain.on('hide-plugin', (event, payload) => {
  console.log(event)
  win?.webContents.send('profile-recieved', payload)
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})


app.on('ready', () => setTimeout(createWindow, 300));
