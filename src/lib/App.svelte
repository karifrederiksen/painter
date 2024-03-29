<script lang="ts">
    import * as Toolbar from "./ui/toolbar/index.js";
    import { Layers } from "./ui/layers/index.js";
    import { Surface } from "./ui/components/surface/index.js";
    import { MiniMap } from "./ui/mini-map/index.js";
    import { Debugging } from "./ui/debugging/index.js";
    import PrimaryButton from "./ui/components/buttons/primary-button.svelte";
    import { onBeforeUnload, getCameraTransform } from "./AppUtil.js";
    import { onPageMount, canvasState, canvasInfo, canvasSender } from "$lib/ui/state.js";
    import { createDeclarations } from "./ui/theme.js";
    import { initState as initCanvasState } from "./canvas/index.js";
    import Performance from "$lib/ui/debugging/performance.svelte";

    let containerRef: HTMLDivElement | undefined;
    let canvasRef: HTMLCanvasElement | undefined;
    $: state = $canvasState;
    $: sender = $canvasSender;

    onPageMount({
        getCanvas() {
            return canvasRef;
        },
        getContainer() {
            return containerRef;
        },
    });

    if (!import.meta.env.DEV) {
        onBeforeUnload();
    }
    const [{ theme }] = initCanvasState();
</script>

<div bind:this={containerRef} class="app-container" style={createDeclarations(theme)}>
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
            <div class="layers-view-container">
                <Surface>
                    <MiniMap camera={state.tool.camera} sender={sender.tool.camera} />
                </Surface>
                <Layers layers={state.layers} sender={sender.layer} />
            </div>
        {/if}
    </div>
    {#if sender && state}
        <div class="bottom-left">
            {#if state.displayStats}
                <div class="render-stats">
                    <Performance />
                </div>
            {/if}
            <div class="utility-buttons">
                <PrimaryButton on:click={sender.randomizeTheme}>Next theme</PrimaryButton>
                <Debugging {sender} config={state} />
            </div>
        </div>
    {/if}
</div>

<style lang="scss">
    @import "../lib/ui/theme.scss";

    .wrapper {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        width: 100%;
        box-sizing: border-box !important;

        ** {
            margin: 0;
            padding: 0;
            border: 0;
            outline: none;
            box-sizing: inherit;
        }
    }

    .bottom-left {
        position: absolute;
        left: 0.5rem;
        bottom: 0.5rem;
        z-index: 100;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .render-stats {
        color: $color-onSurface;
    }

    .utility-buttons {
        display: flex;
        align-items: flex-end;
        gap: 0.5rem;
    }

    .app-container {
        width: 100vw;
        height: 100vh;
        overflow: hidden;
        font-family: $fonts-normal;
    }

    .layers-view-container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        width: 14rem;
        z-index: 1;
    }

    .canvas {
        cursor: crosshair;
        z-index: 0;
    }
</style>
