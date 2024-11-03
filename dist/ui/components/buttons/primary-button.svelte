<script>import { createEventDispatcher } from "svelte";
export let title = void 0;
export let style = void 0;
const dispatch = createEventDispatcher();
</script>

<button {title} {style} class="primary" on:click={() => dispatch("click")}>
    <slot />
</button>

<style>/*
 * css variables don't get typechecked, and it's very hard to refactor them, so we prefer
 * to use these scss variables that refer to the css variables, since the scss has to be compiled,
 * and the compilation will fail when scss-variables are undefined.
 */
.primary {
  font-size: 1rem;
  cursor: pointer;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  position: relative;
  text-decoration: none;
  border: 0;
  border-radius: 0.25rem;
  padding: 0.5rem;
  height: 2.25rem;
  min-width: 4rem;
  transition: all 150ms;
  line-height: 1.4em;
  box-shadow: var(--shadows-button);
  background-color: var(--color-primary);
  color: var(--color-onPrimary);
}
.primary:hover {
  background-color: var(--color-primaryLight);
}
.primary:active {
  background-color: var(--color-primaryDark);
}</style>
