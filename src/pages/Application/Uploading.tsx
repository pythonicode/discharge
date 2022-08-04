import { Text, Center, Group, Stack } from '@mantine/core'
import { useState } from 'react'
import { CloudUpload, FolderPlus } from 'tabler-icons-react'

export function Uploading() {
  const [uploading, setUploading] = useState(false)

  return (
    <Stack
      sx={{
        flexGrow: 1,
        height: '75vh',
        paddingTop: '2rem',
        paddingBottom: '2rem',
      }}
    >
      <Stack
        justify="center"
        align="center"
        sx={{
          height: '30%',
          width: '90vw',
          flexGrow: 1,
          border: '2px dashed #666666',
          transition: 'all 300ms',
          cursor: 'pointer',
          '&:hover': {
            border: '2px dashed #999999',
          },
        }}
        onClick={() => {
          window.Main.send('app:files:select')
          window.Main.once('client:files:selected', (files: any) => {})
        }}
      >
        <CloudUpload size="32px" />
        <Text>Upload Files</Text>
        <Text size="xs" color="dimmed">
          File Size cannot exceed 32 GB
        </Text>
      </Stack>
      <Stack
        justify="center"
        align="center"
        sx={{
          height: '30%',
          width: '90vw',
          flexGrow: 1,
          border: '2px dashed #666666',
          transition: 'all 300ms',
          cursor: 'pointer',
          '&:hover': {
            border: '2px dashed #999999',
          },
        }}
        onClick={() => {
          window.Main.send('app:folder:select')
          window.Main.once('client:folder:selected', (folder: any) => {})
        }}
      >
        <FolderPlus size="32px" />
        <Text>Upload Folder</Text>
        <Text size="xs" color="dimmed">
          Folder Size cannot exceed 32 GB
        </Text>
      </Stack>
    </Stack>
  )
}
