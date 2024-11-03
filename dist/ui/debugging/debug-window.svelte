<script>import DefaultButton from "../components/buttons/default-button.svelte";
import Surface from "../components/surface/surface.svelte";
import Performance from "./performance.svelte";
import Toggles from "./toggles.svelte";
import { canvasEphemeral } from "../state.js";
export let config;
export let sender;
$:
  themeRng = $canvasEphemeral?.themeRng;
let isOpen = false;
function close() {
  isOpen = false;
}
function toggle() {
  isOpen = !isOpen;
}
</script>

<DefaultButton on:click={toggle}>Debug</DefaultButton>
{#if isOpen}
    <div class="backdrop">
        <Surface>
            <div class="container">
                <div class="header"><h2>Debug info</h2></div>
                <div class="body">
                    <div>
                        <h3>RNG</h3>
                        <div class="monospaced">{themeRng.display()}</div>
                    </div>
                    <div class="options">
                        <h3>Options</h3>
                        <Toggles {config} {sender} />
                    </div>
                </div>
                <div class="footer">
                    <DefaultButton on:click={close}>Close</DefaultButton>
                </div>
            </div>
        </Surface>
    </div>
{/if}

<style>/*
 * css variables don't get typechecked, and it's very hard to refactor them, so we prefer
 * to use these scss variables that refer to the css variables, since the scss has to be compiled,
 * and the compilation will fail when scss-variables are undefined.
 */
.backdrop {
  pointer-events: none;
  background-color: rgba(0, 0, 0, 0.2);
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  padding: 12rem;
  display: flex;
}
.container {
  padding: 1rem;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
.body {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.options {
  max-width: 20rem;
}
.footer {
  display: flex;
  justify-content: flex-end;
}
.monospaced {
  font-family: var(--fonts-monospace);
}</style>
