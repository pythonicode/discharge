<script>
  import { fileName } from '@/lib/file'
  import { open } from '@tauri-apps/api/dialog'
  import { appWindow } from '@tauri-apps/api/window'
  import { onDestroy, onMount } from 'svelte'
  import CloudUploadIcon from 'svelte-material-icons/CloudUpload.svelte'
  import FolderUploadIcon from 'svelte-material-icons/FolderUpload.svelte'

  let unlisten = null
  let hovering = null

  onMount(async () => {
    unlisten = await appWindow.onFileDropEvent((event) => {
      if (event.payload.type === 'hover') {
        console.log('User hovering', event.payload.paths)
        hovering = event.payload.paths.length > 0 ? event.payload.paths : null
      } else if (event.payload.type === 'drop') {
        console.log('User dropped', event.payload.paths)
      } else {
        console.log('File drop cancelled')
        hovering = null
      }
    })
  })

  onDestroy(() => {
    if (unlisten) unlisten()
  })

  const chooseFiles = async () => {
    const selected = await open({
      multiple: true,
    })
    if (selected) console.log(selected)
  }

  const chooseDirectory = async () => {
    const selected = await open({
      directory: true,
    })
    if (selected) console.log(selected)
  }
</script>

<div
  on:click={chooseFiles}
  class={`flex flex-col items-center justify-center gap-2 w-full grow border-4 border-dashed border-gray-700 mt-4 hover:bg-gray-800 cursor-pointer hover:border-light transition-colors duration-300 ${
    hovering ? 'bg-gray-800 border-light' : ''
  }`}
>
  <CloudUploadIcon size="3rem" color="#F2F2F2" />
  <div class="text-xl font-bold">Upload {hovering ? fileName(hovering[0]) : 'Files'}</div>
  <div class="text-sm text-gray-500">Maximum 10 GB</div>
</div>

<div
  on:click={chooseDirectory}
  class={`flex flex-col items-center justify-center gap-2 grow w-full border-4 border-dashed border-gray-700 mb-10 mt-4 hover:bg-gray-800 cursor-pointer hover:border-light transition-colors duration-300 ${
    hovering ? 'bg-gray-800 border-light' : ''
  }`}
>
  <FolderUploadIcon size="3rem" color="#F2F2F2" />
  <div class="text-xl font-bold">Upload {hovering ? fileName(hovering[0]) : 'Folder'}</div>
  <div class="text-sm text-gray-500">Maximum 10 GB</div>
</div>
