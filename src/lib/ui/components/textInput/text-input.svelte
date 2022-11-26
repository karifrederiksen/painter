<script lang="ts">
  import { onMount } from "svelte";

  export let initialValue: string;
  export let onChange: (text: string) => void;
  export let onEnter: (text: string) => void = () => {};
  export let autoFocus: boolean = false;

  let inputRef: HTMLInputElement | null = null;

  function handleChange(ev: Event) {
    if (onChange === null) {
      return;
    }

    onChange((ev.target as HTMLInputElement).value);
  }

  function handleKeyboard(ev: KeyboardEvent) {
    if (ev.key !== "Enter" || onEnter === null || inputRef == null) {
      return;
    }
    onEnter(inputRef.value);
  }

  onMount(() => {
    if (autoFocus) {
      inputRef?.focus();
    }
  });
</script>

<input
  bind:this={inputRef}
  on:paste={handleChange}
  on:change={handleChange}
  on:keydown={handleKeyboard}
  class="textInput"
  type="text"
  value={initialValue}
/>

<style lang="scss">
  @import "../../theme.scss";

  .textInput {
    background-color: $color-surface;
    color: $color-onSurface;
    padding: 0.25rem 0.5rem;
    border-color: $color-onSurface;
    border-width: 1px;
    border-style: solid;
    border-radius: 0.25rem;
    font-family: $fonts-monospace;
    width: 100%;

    &:focus {
      border-color: $color-primary;
    }
  }
</style>
