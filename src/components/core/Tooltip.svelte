<script lang="ts">
  export let content: string
  let classes: string = ''
  export { classes as class }
  export let position: 'bottom' | 'top' = 'bottom'

  let ref: HTMLElement
  let tooltip: HTMLElement
</script>

<div bind:this={ref} class={`relative ${classes} group`}>
  <div
    bind:this={tooltip}
    class={`fixed px-2 py-1 bg-dark rounded group-hover:opacity-100 opacity-0 transition-opacity border border-gray-700 text-light text-sm`}
    style={position == 'bottom'
      ? `top: ${ref?.offsetTop + ref?.clientHeight}px; left: ${
          ref?.offsetLeft + ref?.clientWidth / 2 - tooltip?.clientWidth / 2
        }px;`
      : `top: ${ref?.offsetTop - tooltip?.clientHeight}px; left: ${
          ref?.offsetLeft + ref?.clientWidth / 2 - tooltip?.clientWidth / 2
        }px;`}
  >
    {content}
  </div>
  <slot />
</div>
