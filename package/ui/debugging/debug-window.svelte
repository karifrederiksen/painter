<script>import DefaultButton from "../components/buttons/default-button.svelte";
import Surface from "../components/surface/surface.svelte";
import Performance from "./performance.svelte";
import Scripting from "./scripting.svelte";
import { canvasEphemeral } from "../state";
$: themeRng = $canvasEphemeral?.themeRng;
let isOpen = false;
function open() {
    isOpen = true;
}
function close() {
    isOpen = false;
}
</script>

<Surface>
    {#if isOpen}
        <div class="container">
            <DefaultButton on:click={close}>Close</DefaultButton>
            <div class="contentContainer">
                RNG: <div class="monospaced">{themeRng.display()}</div>
                <Performance />
                <Scripting />
            </div>
        </div>
    {:else}
        <DefaultButton on:click={open}>Debug</DefaultButton>
    {/if}
</Surface>

<style>/*
 * css variables don't get typechecked, and it's very hard to refactor them, so we prefer
 * to use these scss variables that refer to the css variables, since the scss has to be compiled,
 * and the compilation will fail when scss-variables are undefined.
 */
.container {
  z-index: 100;
  display: flex;
  padding: 0.5rem 1rem;
}

.contentContainer {
  padding-left: 1rem;
}

.monospaced {
  font-family: var(--fonts-monospace);
}</style>
