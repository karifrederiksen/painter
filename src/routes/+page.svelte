<script lang="ts">
    import { onMount } from "svelte";
    import * as Toolbar from "../lib/ui/toolbar";
    import { Layers } from "../lib/ui/layers";
    import * as Input from "../lib/canvas/input";
    import * as Keymapping from "../lib/canvas/keymapping";
    import * as Canvas from "../lib/canvas";
    import * as Setup from "../lib/ui/setup";
    import { SetOnce, FrameStream, Store, Vec2, type PushOnlyArray } from "../lib/util";
    import { Surface } from "../lib/ui/components";
    import { samples } from "../lib/ui/debugging";
    import { MiniMap } from "../lib/ui/mini-map";
    import { Debugging } from "../lib/ui/debugging";
    import { Subscription as RxSubscription } from "rxjs";
    import PrimaryButton from "$lib/ui/components/buttons/primary-button.svelte";
    import {
        onBeforeUnload,
        getCanvasOffset,
        getCanvasInfo,
        createUpdateThemeEffect,
        getCameraTransform,
        onLayoutChange,
    } from "./util";
    import { dev } from "$app/environment";

    const updateTheme = createUpdateThemeEffect();
    const [initialState, initialEphemeral] = Canvas.initState();
    const canvasResolution = new Vec2(800, 800);

    let canvasRef: HTMLCanvasElement | undefined;
    let debuggingGl = new SetOnce<WebGLRenderingContext>();
    let state: Canvas.Config | undefined;
    let sender: Canvas.Sender | undefined;
    let canvasInfo: Canvas.CanvasInfo = getCanvasInfo({
        canvasOffset: new Vec2(initialState.tool.camera.offsetX, initialState.tool.camera.offsetY),
        canvasResolution,
    });
    let store: Store.Store<Canvas.Config, Canvas.State, Canvas.CanvasMsg> | undefined;

    interface Disposals extends PushOnlyArray<(() => void) | RxSubscription> {}

    onMount(() => {
        if (canvasRef == null) {
            throw new Error("Canvas not found");
        }
        const canvas = Canvas.Canvas.create(canvasRef, {
            onStats: (stats) => {
                samples.update((c) => c.update(stats));
            },
            onWebglContextCreated: (gl) => {
                console.log("debuggingGl set");
                debuggingGl.set(gl);
            },
        });
        if (canvas === null) {
            throw new Error("Failed to initialize Canvas");
        }

        const store_ = Store.create<Canvas.Config, Canvas.State, Canvas.CanvasMsg, Canvas.Effect>({
            initialState,
            initialEphemeral,
            effectsHandler: (ef) => canvas.handle(ef),
            forceRender: () => {},
            update: (state, ephState, msg) => {
                const res = Canvas.update(canvasInfo, state, ephState, msg);
                state = res[0];
                updateTheme(state.theme);
                if (msg.tag !== "OnFrame") {
                    console.log(`Update [${msg.tag}]`, state);
                }
                return res;
            },
        });
        store = store_;
        sender = new Canvas.Sender(store_.send);
        console.log("Painter mounted");

        const disposals: Disposals = [];

        const canvasObs = Input.listen(canvasRef);
        disposals.push(canvasObs.click.subscribe(sender.onClick));
        disposals.push(canvasObs.release.subscribe(sender.onRelease));
        disposals.push(canvasObs.move.subscribe(() => {}));
        disposals.push(canvasObs.drag.subscribe(sender.onDrag));
        disposals.push(
            Keymapping.listen({
                handle: sender.onKeyboard,
            }),
        );
        disposals.push(FrameStream.FrameStream.make(sender.onFrame));
        disposals.push(() => canvas.dispose());

        if (dev) {
            Setup.setup(canvasRef, () => store_.getState(), sender).then(() => {
                console.log("setup complete");
                state = store_.getState();
            });
        }
        return () => {
            for (const d of disposals) {
                if (d instanceof RxSubscription) {
                    d.unsubscribe();
                } else {
                    d();
                }
            }
            console.log("Painter unmounted");
        };
    });

    onLayoutChange(() => {
        if (!canvasRef) return;
        canvasInfo = getCanvasInfo({
            canvasOffset: getCanvasOffset(canvasRef),
            canvasResolution,
        });
    });

    onBeforeUnload();
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
            width={canvasInfo?.resolution.x ?? 800}
            height={canvasInfo?.resolution.y ?? 800}
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
            <PrimaryButton onClick={sender.randomizeTheme}>Next theme</PrimaryButton>
        </div>
    {/if}
    {#if dev && store}
        <div class="bottomRight">
            <Debugging gl={debuggingGl} themeRng={store.getEphemeral().themeRng} />
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
