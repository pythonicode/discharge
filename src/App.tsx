import { GlobalStyle } from './styles/GlobalStyle'
import { MantineProvider, Group } from '@mantine/core'
import { ElectronProvider } from './providers/ElectronProvider'
import { Page } from './Page'

export function App() {
  return (
    <ElectronProvider>
      <MantineProvider
        theme={{ colorScheme: 'dark', fontFamily: 'Roboto' }}
        withGlobalStyles
        withNormalizeCSS
      >
        <Group
          direction="column"
          position="center"
          align="center"
          sx={{ width: '100vw', height: '100vh' }}
          spacing={0}
        >
          <GlobalStyle />
          <Page />
        </Group>
      </MantineProvider>
    </ElectronProvider>
  )
}
