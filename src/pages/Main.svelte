<script>
  import FolderIcon from 'svelte-material-icons/Folder.svelte'
  import UploadIcon from 'svelte-material-icons/Upload.svelte'
  import SettingsIcon from 'svelte-material-icons/Cog.svelte'
  import Files from './Main/Files.svelte'
  import Settings from './Main/Settings.svelte'
  import Upload from './Main/Upload.svelte'

  let state = 'files'
</script>

<div class="flex flex-col">
  <div class="flex -m-4">
    <div
      on:click={() => (state = 'files')}
      class={`flex items-center justify-center transition-all grow p-4 cursor-pointer ${
        state == 'files' ? 'border-b bg-gray-800' : 'border-b border-gray-700'
      }`}
    >
      <FolderIcon size="1.5rem" />
    </div>
    <div
      on:click={() => (state = 'upload')}
      class={`flex items-center justify-center transition-all grow p-4 cursor-pointer ${
        state == 'upload' ? 'border-b bg-gray-800' : 'border-b border-gray-700'
      }`}
    >
      <UploadIcon size="1.5rem" />
    </div>
    <div
      on:click={() => (state = 'settings')}
      class={`flex items-center justify-center transition-all grow p-4 cursor-pointer ${
        state == 'settings' ? 'border-b bg-gray-800' : 'border-b border-gray-700'
      }`}
    >
      <SettingsIcon size="1.5rem" />
    </div>
  </div>
</div>
<div class="flex flex-col items-center justify-start my-4 h-full">
  {#if state === 'files'}
    <Files />
  {:else if state === 'upload'}
    <Upload />
  {:else if state === 'settings'}
    <Settings />
  {/if}
</div>
