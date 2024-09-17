<script>import { afterUpdate } from "svelte";
export let isOpen;
export let onClose;
let backgroundRef;
const onBackgroundClick = (ev) => {
    if (ev.target === backgroundRef) {
        onClose();
    }
};
afterUpdate(() => {
    if (isOpen) {
        document.body.style.overflow = "hidden";
    }
    else {
        document.body.style.overflow = "";
    }
});
</script>

{#if isOpen}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="backgroundLayer" bind:this={backgroundRef} on:click={onBackgroundClick}>
        <div class="container">
            <div class="content">
                <slot name="body" />
            </div>
            <div class="divider" />
            <div class="footer">
                <slot name="footer" />
            </div>
        </div>
    </div>
{/if}

<style>/*
 * css variables don't get typechecked, and it's very hard to refactor them, so we prefer
 * to use these scss variables that refer to the css variables, since the scss has to be compiled,
 * and the compilation will fail when scss-variables are undefined.
 */
.backgroundLayer {
  z-index: 2000;
  position: absolute;
  background-color: rgba(0, 0, 0, 0.5);
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
}

.container {
  width: max-content;
  min-width: 400px;
  background-color: var(--color-surface);
  box-shadow: var(--shadows-button);
  color: var(--color-onSurface);
  border-radius: 0.25rem;
  margin-left: auto;
  margin-right: auto;
  margin-top: 8rem;
  padding: 0.5rem 1rem;
}

.content {
  color: inherit;
}

.divider {
  width: 100%;
  height: 1px;
  background-color: var(--color-onSurface);
  opacity: 0.6;
  margin: 0.5rem 0;
}

.footer {
  display: flex;
  justify-content: flex-end;
}</style>
