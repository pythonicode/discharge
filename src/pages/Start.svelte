<script lang="ts">
  import { open } from '@tauri-apps/api/dialog'
  import ArrowLeft from 'svelte-material-icons/ArrowLeft.svelte'
  import Eye from 'svelte-material-icons/Eye.svelte'
  import EyeOff from 'svelte-material-icons/EyeOff.svelte'
  import { Link, navigate } from 'svelte-navigator'
  import { onMount } from 'svelte'
  import Copy from '@/components/core/Copy.svelte'
  import Tooltip from '@/components/core/Tooltip.svelte'
  import { preferences, setFilePath, setPassword, generateUserId } from '@/lib/tauri'
  import Loader from '@/components/core/Loader.svelte'

  let password = ''
  let confirm = ''
  let visible = false

  let error = [false, false]
  let message = ''

  onMount(() => {
    generateUserId()
  })

  const chooseDirectory = async () => {
    const selected = await open({
      directory: true,
    })
    if (selected) setFilePath(selected as string)
  }

  function scorePassword(pass: string) {
    var score = 0
    if (!pass) return score

    var letters = new Map()
    for (var i = 0; i < pass.length; i++) {
      letters.set(pass[i], (letters.get(pass[i]) || 0) + 1)
      score += 5.0 / letters.get(pass[i])
    }

    var variations: RegExp[] = [/\d/, /[a-z]/, /[A-Z]/, /\W/]

    let count = variations.reduce((count, variation) => {
      let result = (pass.match(variation) || []).length
      return count + result
    }, 0)

    score += (count - 1) * 10

    return score
  }

  function submit() {
    const score = scorePassword(password)
    if (score < 75) {
      error[0] = true
      message = 'Password is too weak. Please use a stronger password.'
      return
    }
    if (confirm != password) {
      error[1] = true
      message = 'Passwords do not match. Please try again.'
      return
    }
    message = ''
    error = [false, false]
    setPassword(password)
    navigate('/main')
  }
</script>

<div class="flex flex-col items-center gap-4 h-full ">
  <div class="flex w-full">
    <Link to="/welcome">
      <ArrowLeft size="1.5em" />
    </Link>
  </div>
  <h3 class="text-3xl font-bold">Choose a Directory</h3>
  <div
    class="border border-gray-500 rounded px-4 py-2 duration-300 bg-gray-800 w-full overflow-hidden text-gray-400 hover:border-light transition-colors cursor-pointer select-none"
    on:click={chooseDirectory}
  >
    {$preferences?.path || 'Select a directory'}
  </div>
  <div class="text-sm text-gray-500">We recommend creating a new empty directory.</div>
  <h3 class="text-3xl font-bold">Secure your Wallet</h3>
  <div
    class="border border-gray-500 rounded px-4 py-2 duration-300 bg-gray-800 w-full overflow-hidden text-gray-400 flex items-center justify-between"
  >
    {#if $preferences?.uid}
      {$preferences?.uid}
    {:else}
      <Loader />
    {/if}
    <Tooltip content="Copy" position="top">
      <Copy content={$preferences?.uid} />
    </Tooltip>
  </div>
  <div class="relative w-full">
    {#if visible}
      <input
        type="text"
        bind:value={password}
        class={`w-full ${error[0] ? 'border-red-500' : 'border-gray-500'}`}
        placeholder="Password"
        on:input={() => {
          error[0] = false
          message = ''
        }}
        on:change={(event) => {
          setPassword(event?.currentTarget.value)
        }}
      />
    {:else}
      <input
        type="password"
        bind:value={password}
        class={`w-full ${error[0] ? 'border-red-500' : 'border-gray-500'}`}
        placeholder="Password"
        on:input={() => {
          error[0] = false
          message = ''
        }}
      />
    {/if}
    <div
      class={`h-1 rounded absolut mt-2 -mb-2 ${
        scorePassword(password) > 75
          ? 'bg-green-600'
          : scorePassword(password) > 30
          ? 'bg-yellow-600'
          : 'bg-red-600'
      }`}
      style={`width: ${Math.min(scorePassword(password), 100)}%`}
    />
    <div
      on:click={() => {
        visible = !visible
      }}
      class="absolute right-4 top-3 text-gray-400 cursor-pointer"
    >
      {#if visible}
        <EyeOff />
      {:else}
        <Eye />
      {/if}
    </div>
  </div>
  {#if visible}
    <input
      type="text"
      bind:value={confirm}
      class={`w-full ${error[1] ? 'border-red-500' : 'border-gray-500'}`}
      placeholder="Confirm Password"
      on:input={() => {
        error[0] = false
        message = ''
      }}
    />
  {:else}
    <input
      type="password"
      bind:value={confirm}
      class={`w-full ${error[1] ? 'border-red-500' : 'border-gray-500'}`}
      placeholder="Confirm Password"
      on:input={() => {
        error[0] = false
        message = ''
      }}
    />
  {/if}
  <div class="text-sm text-red-500 whitespace-nowrap overflow-hidden -my-2">
    {message}
  </div>
  <div class="text-sm text-gray-500">
    Please store your User ID and Password in a safe place. <br /> You will need both of them to access
    your files.
  </div>
  <button class="w-full" on:click={submit}>Finish</button>
</div>
