<script lang="ts">
  import Copy from '@/components/core/Copy.svelte'

  import Tooltip from '@/components/core/Tooltip.svelte'

  import { preferences, setFilePath, removeAccount, setLanguage } from '@/lib/tauri'
  import { open } from '@tauri-apps/api/dialog'
  import { navigate } from 'svelte-navigator'

  const chooseDirectory = async () => {
    const selected = await open({
      directory: true,
    })
    if (selected) setFilePath(selected as string)
  }

  const updateLanguage = (
    event: Event & {
      currentTarget: EventTarget & HTMLSelectElement
    }
  ) => {
    const language = event.currentTarget?.value
    if (language) setLanguage(language)
  }

  let confirm = false
  let progress = 0
  let timeout: number | undefined = undefined

  const removeWallet = () => {
    if (!confirm) confirm = true
    timeout = setTimeout(() => {
      removeAccount()
      clearTimeout(timeout)
    }, 3000)
  }

  const cancel = () => {
    confirm = false
    progress = 0
    clearTimeout(timeout)
  }
</script>

<div class="flex flex-col w-full h-full py-4 gap-4">
  <div>
    <div class="text-left font-semibold my-2">File Path</div>
    <div
      class="border border-gray-500 rounded px-4 py-2 duration-300 bg-gray-800 w-full overflow-hidden text-gray-400 hover:border-light transition-colors cursor-pointer select-none"
      on:click={chooseDirectory}
    >
      {$preferences?.path || 'Select a directory'}
    </div>
  </div>
  <div>
    <div class="text-left font-semibold my-2">Account Details</div>
    <div
      class="border border-gray-500 rounded px-4 py-2 duration-300 bg-gray-800 w-full overflow-hidden text-gray-400 flex items-center justify-between my-2"
    >
      {$preferences?.uid}
      <Tooltip content="Copy" position="top">
        <Copy content={$preferences?.uid} />
      </Tooltip>
    </div>
    <select value={$preferences?.lang} on:change={updateLanguage} class="w-full my-2">
      <option value="default">English</option>
      <option value="ru">Русский</option>
    </select>
  </div>
  <button
    on:mousedown={removeWallet}
    on:mouseleave={cancel}
    on:mouseup={cancel}
    class="light red active:scale-95 transition-transform duration-300"
  >
    {#if !confirm}
      Remove Wallet
    {:else}
      Hold to Confirm
    {/if}
  </button>
</div>
