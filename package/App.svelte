<script>import * as Toolbar from "./ui/toolbar/index.js";
import { Layers } from "./ui/layers/index.js";
import { Surface } from "./ui/components/surface/index.js";
import { MiniMap } from "./ui/mini-map/index.js";
import { Debugging } from "./ui/debugging/index.js";
import PrimaryButton from "./ui/components/buttons/primary-button.svelte";
import { onBeforeUnload, getCameraTransform } from "./AppUtil.js";
import { onPageMount, canvasState, canvasInfo, canvasSender } from "./ui/state.js";
let canvasRef;
$: state = $canvasState;
$: sender = $canvasSender;
onPageMount(() => canvasRef);
if (!import.meta.env.DEV) {
    onBeforeUnload();
}
</script>

<div class="appContainer">
    <div class="wrapper">
        {#if sender && state}
            <Toolbar.Toolbar
                sender={sender.tool}
                tool={state.tool}
                transientState={{ isDetailsExpanded: true }}
            />
        {/if}
        <canvas
            class="canvas"
            bind:this={canvasRef}
            width={$canvasInfo.resolution.x ?? 800}
            height={$canvasInfo.resolution.y ?? 800}
            style={!state ? undefined : `transform: ${getCameraTransform(state.tool.camera)}`}
        />
        {#if sender && state}
            <div class="layersViewContainer">
                <Surface>
                    <MiniMap camera={state.tool.camera} sender={sender.tool.camera} />
                </Surface>
                <Layers layers={state.layers} sender={sender.layer} />
            </div>
        {/if}
    </div>
    {#if sender && state}
        <div class="bottomLeft">
            <PrimaryButton on:click={sender.randomizeTheme}>Next theme</PrimaryButton>
        </div>
    {/if}
    {#if import.meta.env.DEV}
        <div class="bottomRight">
            <Debugging />
        </div>
    {/if}
</div>

<style>/*
 * css variables don't get typechecked, and it's very hard to refactor them, so we prefer
 * to use these scss variables that refer to the css variables, since the scss has to be compiled,
 * and the compilation will fail when scss-variables are undefined.
 */
.wrapper {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  box-sizing: border-box !important;
}
.wrapper ** {
  margin: 0;
  padding: 0;
  border: 0;
  outline: none;
  box-sizing: inherit;
}

.bottomLeft {
  position: absolute;
  left: 0.5rem;
  bottom: 0.5rem;
}

.bottomRight {
  position: absolute;
  right: 0.5rem;
  bottom: 0.5rem;
}

.appContainer {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  font-family: var(--fonts-normal);
}

.layersViewContainer {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 14rem;
  z-index: 1;
}

.canvas {
  cursor: crosshair;
  z-index: 0;
}</style>
