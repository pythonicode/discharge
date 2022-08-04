import { contextBridge, ipcRenderer } from 'electron'

export const api = {
  /**
   * Here you can expose functions to the renderer process
   * so they can interact with the main (electron) side
   * without security problems.
   *
   * The function below can accessed using `window.Main.sendMessage`
   */

  send: (message: string, data: any = undefined) => {
    ipcRenderer.send(message, data)
  },

  sendSync: (message: string, data: any = undefined) => {
    return ipcRenderer.sendSync(message, data)
  },

  /**
   * Provide an easier way to listen to events
   */
  on: (channel: string, callback: Function) => {
    ipcRenderer.on(channel, (_, data) => callback(data))
  },

  once: (channel: string, callback: Function) => {
    ipcRenderer.once(channel, (_, data) => callback(data))
  },

  removeEventListener: (channel: string) => {
    ipcRenderer.removeAllListeners(channel)
  },
}

contextBridge.exposeInMainWorld('Main', api)
