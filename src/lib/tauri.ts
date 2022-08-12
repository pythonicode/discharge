import { invoke } from '@tauri-apps/api/tauri'
import { readable } from 'svelte/store'
import type { Preferences } from './types'
import { listen } from '@tauri-apps/api/event'

export const connected = readable<boolean | null>(null, (set) => {
  const unsubscribe = preferences.subscribe((preferences) => {
    if (preferences) set(preferences.uid != null && preferences.password != null)
  })
  return unsubscribe
})

export const preferences = readable<Preferences | null>(null, (set) => {
  invoke('get_preferences', {}).then((preferences) => {
    set(preferences as Preferences)
  })

  const unlisten = listen('updated:preferences', (event) => {
    set(event.payload as Preferences)
  })

  return () => {
    unlisten.then((call) => call())
  }
})

export const setFilePath = (path: string) => {
  invoke('set_path', { path })
}

export const setLanguage = (lang: string) => {
  invoke('set_lang', { lang })
}

export const setUserId = (uid: string) => {
  invoke('set_uid', { uid })
}

export const setPassword = (password: string) => {
  invoke('set_password', { password })
}

export const generateUserId = () => {
  invoke('generate_uid')
}

export const removeAccount = () => {
  invoke('remove_account')
}
