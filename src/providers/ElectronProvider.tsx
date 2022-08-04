import { useState, useEffect, useContext, createContext } from 'react'

type Preferences = {
  path: string
  uid: string
  key: string
}

const ElectronContext = createContext<any>(null)

export function useElectron() {
  return useContext(ElectronContext)
}

export function ElectronProvider({ children }: any) {
  const [preferences, setPreferences] = useState<Preferences | null>(null)
  const [page, setPage] = useState<string>('welcome')

  useEffect(() => {
    setPreferences(window.Main.sendSync('app:preferences:get'))
    window.Main.on('client:preferences:updated', (preferences: Preferences) => {
      setPreferences(preferences)
    })
  }, [])

  useEffect(() => {
    if (preferences && preferences.uid && preferences.key)
      setPage('application')
  }, [preferences])

  return (
    <ElectronContext.Provider
      value={{ preferences: preferences, page: page, setPage: setPage }}
    >
      {children}
    </ElectronContext.Provider>
  )
}
