<script>import { createEventDispatcher } from "svelte";
export let title = undefined;
export let isDown;
const dispatch = createEventDispatcher();
const bubble = () => {
    if (!isDown) {
        dispatch("click");
    }
};
</script>

<button {title} class={isDown ? "sinkableSunk" : "sinkableUnsunk"} on:click={bubble}>
    <slot />
</button>

<style>/*
 * css variables don't get typechecked, and it's very hard to refactor them, so we prefer
 * to use these scss variables that refer to the css variables, since the scss has to be compiled,
 * and the compilation will fail when scss-variables are undefined.
 */
.sinkableUnsunk {
  background-color: rgba(0, 0, 0, 0);
  padding: 12px 16px;
  border: 0;
  border-bottom: 2px solid transparent;
  transition: background-color 0.15s;
}
.sinkableUnsunk:hover {
  background-color: rgba(0, 0, 0, 0.15);
}

.sinkableSunk {
  background: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.2));
  padding: 12px 16px;
  border: 0;
  border-bottom: 2px solid rgba(255, 255, 255, 0.5);
}</style>
