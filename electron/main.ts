import { join } from 'path'
import chokidar from 'chokidar'
import fs from 'fs'

import { Store } from './storage'
import {
  createCollection,
  decrypt,
  deleteItem,
  encrypt,
  getItems,
  readItem,
  uploadFile,
} from './estuary'

import {
  app,
  BrowserWindow,
  ipcMain,
  Tray,
  nativeImage,
  Menu,
  dialog,
} from 'electron'

let window: BrowserWindow | null
let tray: Tray | null

declare const MAIN_WINDOW_WEBPACK_ENTRY: string
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string

const __dirname =
  process.env.NODE_ENV === 'production'
    ? process.resourcesPath
    : app.getAppPath()

if (!fs.existsSync(join(__dirname, 'files')))
  fs.mkdirSync(join(__dirname, 'files'))
if (!fs.existsSync(join(app.getPath('userData'), 'Temp')))
  fs.mkdirSync(join(app.getPath('userData'), 'Temp'))

const preferences = new Store({
  configName: 'preferences',
  defaults: {
    path: join(__dirname, 'files'),
    sync: 'auto',
  },
})

const watcher = chokidar.watch(preferences.get('path'), {
  ignored: /(^|[\/\\])\../,
  persistent: true,
  usePolling: true,
})

function createTray() {
  const icon = join(__dirname, 'assets', 'icon.ico') // required.
  const trayicon = nativeImage.createFromPath(icon)
  tray = new Tray(trayicon.resize({ width: 16 }))
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open',
      click: () => {
        createWindow()
      },
    },
    {
      label: 'Quit',
      click: () => {
        app.quit() // actually quit the app.
      },
    },
  ])
  tray.setContextMenu(contextMenu)
}

function createWindow() {
  if (!tray) createTray()

  window = new BrowserWindow({
    icon: join(__dirname, 'assets', 'icon.ico'),
    resizable: false,
    width: 400,
    height: 600,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  })

  window.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)
  window.setMenu(null)
  window.webContents.openDevTools()

  window.on('closed', () => {
    window = null
  })
}

async function registerListeners() {
  /* IPC Main Listeners */

  ipcMain.on('message', (_, message) => {
    console.log(message)
  })

  ipcMain.on('app:preferences:get', (event, _) => {
    event.returnValue = preferences.data
  })

  ipcMain.on('app:preferences:delete', (event, _) => {
    fs.rmSync(join(app.getPath('userData'), 'preferences.config'))
    event.reply('client:preferences:updated')
  })

  ipcMain.on('app:preferences:set:path', async (event, data) => {
    try {
      const response = await dialog.showOpenDialog({
        properties: ['openDirectory'],
      })
      if (response.canceled) return
      watcher.unwatch(preferences.get('path'))
      preferences.set('path', response.filePaths[0])
      watcher.add(response.filePaths[0])
      event.reply('client:preferences:updated', preferences.data)
    } catch (error) {
      console.log(error)
    }
  })

  ipcMain.on('app:preferences:create:uid', async (_, __) => {
    if (!preferences.get('uid')) {
      const collection = await createCollection()
      preferences.set('uid', collection.uuid)
    }
  })

  ipcMain.on('app:preferences:set:uid', async (event, uid) => {
    if (!preferences.get('uid')) preferences.set('uid', uid)
    event.reply('client:preferences:updated', preferences.data)
  })

  ipcMain.on('app:preferences:set:key', async (event, key) => {
    preferences.set('key', key)
    event.reply('client:preferences:updated', preferences.data)
  })

  ipcMain.on('app:preferences:set:sync', async (event, sync) => {
    preferences.set('sync', sync)
    event.reply('client:preferences:updated', preferences.data)
  })

  ipcMain.on('app:files:get', async (event, path) => {
    const files = await getItems(preferences.get('uid'), path)
    if (files === null) {
      event.returnValue = []
      return
    }
    for (let i = 0; i < files.length; i++) {
      if (
        fs.existsSync(
          join(
            preferences.get('path'),
            path,
            files[i].name.slice(0, files[i].name.length - 4)
          )
        )
      )
        files[i].exists = true
      else files[i].exists = false
    }
    event.returnValue = files
  })

  ipcMain.on('app:files:select', async (event, _) => {
    const response = await dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
    })
    if (response.canceled) event.reply('client:files:selected', null)
    else {
      event.reply('client:files:selected', response.filePaths)
      for (let i = 0; i < response.filePaths.length; i++) {
        const out = await encrypt(
          response.filePaths[i],
          preferences.get('key'),
          join(app.getPath('userData'), 'Temp')
        )
        const path = out.substring(out.lastIndexOf('\\'))
        await uploadFile(preferences.get('uid'), out, path, null)
      }
    }
  })

  ipcMain.on('app:folder:select', async (event, _) => {
    const response = await dialog.showOpenDialog({
      properties: ['openDirectory'],
    })
    if (response.canceled) event.reply('client:folder:selected', null)
    else {
      event.reply('client:folder:selected', response.filePaths[0])
    }
  })

  ipcMain.on('app:file:download', async (event, data) => {
    const file = data.file
    const directory = data.directory.replace(/\//g, '\\')
    const path = await readItem(file, join(app.getPath('userData'), 'Temp'))
    if (!fs.existsSync(join(preferences.get('path'), directory)))
      fs.mkdirSync(join(preferences.get('path'), directory))
    await decrypt(
      path,
      preferences.get('key'),
      join(preferences.get('path'), directory)
    )
    event.reply(`client:file:loaded:${directory + file.name}`)
  })

  ipcMain.on('app:file:delete', async (event, file) => {
    console.log(file)
    try {
      await deleteItem(preferences.get('uid'), file)
    } catch (error) {
      console.error(error)
    }
  })

  ipcMain.on('app:file:remove', (event, path) => {
    const full = join(preferences.get('path'), path)
    fs.unlinkSync(full)
    event.reply(
      `client:file:removed:${full.replace(preferences.get('path'), '')}`
    )
  })

  /* Chokidar (Directory) Listeners */
  watcher.on('add', async (path: string) => {
    if (preferences.get('sync') !== 'auto') return
    else {
      const out = await encrypt(
        path,
        preferences.get('key'),
        join(app.getPath('userData'), 'Temp')
      )
      const dir = path.replace(preferences.get('path'), '') + '.enc'
      await uploadFile(preferences.get('uid'), out, dir, null)
      fs.unlinkSync(out)
      window?.webContents.send('client:refresh')
    }
  })

  watcher.on('unlink', (path: string) => {
    window?.webContents.send(
      `client:file:removed:${path.replace(preferences.get('path'), '')}`
    )
  })
}

app
  .on('ready', createWindow)
  .whenReady()
  .then(registerListeners)
  .catch(e => console.error(e))

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin' && window) window.hide()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
