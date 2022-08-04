import { useElectron } from './providers/ElectronProvider'
import { Welcome } from './pages/Welcome'
import { Onboarding } from './pages/Onboarding'
import { Application } from './pages/Application'

export function Page() {
  const { page } = useElectron()

  return (
    <>
      {page == 'welcome' && <Welcome />}
      {page == 'onboarding' && <Onboarding />}
      {page == 'application' && <Application />}
    </>
  )
}
