<script>import { createEventDispatcher } from "svelte";
import { onMount } from "svelte";
export let initialValue;
export let autoFocus = false;
const dispatch = createEventDispatcher();
let inputRef = null;
$: text = initialValue;
function handleChange(ev) {
    dispatch("change", ev.target.value);
}
function handleKeyboard(ev) {
    if (ev.key !== "Enter") {
        return;
    }
    dispatch("enter", text);
}
onMount(() => {
    if (autoFocus) {
        inputRef?.focus();
    }
});
</script>

<input
    bind:this={inputRef}
    bind:value={text}
    on:paste={handleChange}
    on:change={handleChange}
    on:keydown={handleKeyboard}
    class="textInput"
    type="text"
/>

<style>/*
 * css variables don't get typechecked, and it's very hard to refactor them, so we prefer
 * to use these scss variables that refer to the css variables, since the scss has to be compiled,
 * and the compilation will fail when scss-variables are undefined.
 */
.textInput {
  background-color: var(--color-surface);
  color: var(--color-onSurface);
  padding: 0.25rem 0.5rem;
  border-color: var(--color-onSurface);
  border-width: 1px;
  border-style: solid;
  border-radius: 0.25rem;
  font-family: var(--fonts-monospace);
  width: 100%;
}
.textInput:focus {
  border-color: var(--color-primary);
}</style>
