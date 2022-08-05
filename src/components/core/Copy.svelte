<script>
  import ContentCopy from 'svelte-material-icons/ContentCopy.svelte'
  import Check from 'svelte-material-icons/Check.svelte'
  import { writeText } from '@tauri-apps/api/clipboard'

  export let content

  let copied = false

  function copy() {
    if (copied) return
    writeText(content)
    copied = true
    setTimeout(() => {
      copied = false
    }, 1000)
  }
</script>

<div class="cursor-pointer" on:click={copy}>
  {#if copied}
    <Check />
  {:else}
    <ContentCopy />
  {/if}
</div>
