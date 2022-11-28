<script lang="ts">
    import * as Toolbar from "./ui/toolbar";
    import { Layers } from "./ui/layers";
    import { Surface } from "./ui/components";
    import { MiniMap } from "./ui/mini-map";
    import { Debugging } from "./ui/debugging";
    import PrimaryButton from "./ui/components/buttons/primary-button.svelte";
    import { onBeforeUnload, getCameraTransform } from "./AppUtil";
    import { onPageMount, canvasState, canvasInfo, canvasSender } from "$lib/ui/state";
    import { dev } from "$app/environment";

    let canvasRef: HTMLCanvasElement | undefined;
    $: state = $canvasState;
    $: sender = $canvasSender;

    onPageMount(() => canvasRef);

    if (!dev) {
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
    {#if dev}
        <div class="bottomRight">
            <Debugging />
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
        font-family: $fonts-normal;
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
    }
</style>
