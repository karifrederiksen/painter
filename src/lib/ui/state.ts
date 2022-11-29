import { writable, type Readable } from "svelte/store";
import * as Canvas from "$lib/canvas";

import { afterUpdate, onMount } from "svelte";
import * as Input from "$lib/canvas/input";
import * as Keymapping from "$lib/canvas/keymapping";
import * as Setup from "$lib/ui/setup";
import { FrameStream, Store, Vec2, type PushOnlyArray } from "$lib/util";
import { samples } from "$lib/ui/debugging";
import * as Theme from "$lib/ui/theme";

type Disposals = PushOnlyArray<(() => void) | { unsubscribe(): void }>;

export const canvasResolution = new Vec2(800, 800);
const [initialState, initialEphemeral] = Canvas.initState();

export const getCanvasInfo = ({
    canvasOffset,
    canvasResolution,
}: {
    readonly canvasOffset: Vec2;
    readonly canvasResolution: Vec2;
}): Canvas.CanvasInfo => {
    return {
        resolution: canvasResolution,
        halfResoution: canvasResolution.multiplyScalar(0.5),
        offset: canvasOffset,
    };
};

export const initialCanvasInfo: Canvas.CanvasInfo = getCanvasInfo({
    canvasOffset: new Vec2(initialState.tool.camera.offsetX, initialState.tool.camera.offsetY),
    canvasResolution,
});

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noopSender = new Canvas.Sender((x) => {});

const debuggingGl_ = writable<WebGLRenderingContext>();
const state_ = writable<Canvas.Config>(initialState);
const canvasSender_ = writable<Canvas.Sender>(noopSender);
const canvasInfo_ = writable<Canvas.CanvasInfo>(initialCanvasInfo);
const canvasEphemeral_ = writable<Canvas.State>(initialEphemeral);

export const debuggingGl: Readable<WebGLRenderingContext> = debuggingGl_;
export const canvasState: Readable<Canvas.Config> = state_;
export const canvasSender: Readable<Canvas.Sender> = canvasSender_;
export const canvasInfo: Readable<Canvas.CanvasInfo> = canvasInfo_;
export const canvasEphemeral: Readable<Canvas.State> = canvasEphemeral_;

export const onPageMount = (getCanvas: () => HTMLCanvasElement | undefined): void => {
    let canvasInfo: Canvas.CanvasInfo = getCanvasInfo({
        canvasOffset: new Vec2(initialState.tool.camera.offsetX, initialState.tool.camera.offsetY),
        canvasResolution,
    });
    onMount(() => {
        const htmlCanvas = getCanvas();
        if (!htmlCanvas) {
            throw new Error("Canvas not found");
        }

        const canvas = Canvas.Canvas.create(htmlCanvas, {
            onStats: (stats) => {
                samples.update((c) => c.update(stats));
            },
            onWebglContextCreated: (gl) => {
                console.log("debuggingGl set");
                debuggingGl_.set(gl);
            },
        });
        if (canvas === null) {
            throw new Error("Failed to initialize Canvas");
        }

        const store_ = Store.create<Canvas.Config, Canvas.State, Canvas.CanvasMsg, Canvas.Effect>({
            initialState,
            initialEphemeral,
            effectsHandler: (ef) => canvas.handle(ef),
            forceRender: (nextState, ephState) => {
                state_.set(nextState);
                canvasEphemeral_.set(ephState);
                updateTheme(nextState.theme);
            },
            update: (state, ephState, msg) => {
                const res = Canvas.update(canvasInfo, state, ephState, msg);
                if (msg.tag !== "OnFrame") {
                    console.log(`UPD [${msg.tag}]`, res);
                }
                return res;
            },
        });
        const sender = new Canvas.Sender(store_.send);
        canvasSender_.set(sender);
        console.log("Painter mounted");

        const disposals: Disposals = [];

        const canvasObs = Input.listen(htmlCanvas);
        disposals.push(canvasObs.click.subscribe(sender.onClick));
        disposals.push(canvasObs.release.subscribe(sender.onRelease));
        disposals.push(
            canvasObs.move.subscribe(() => {
                /**/
            }),
        );
        disposals.push(canvasObs.drag.subscribe(sender.onDrag));
        disposals.push(
            Keymapping.listen({
                handle: sender.onKeyboard,
            }),
        );
        disposals.push(FrameStream.FrameStream.make(sender.onFrame));
        disposals.push(() => canvas.dispose());

        if (import.meta.env.DEV) {
            Setup.setup(htmlCanvas, () => store_.getState(), sender).then(() => {
                console.log("Setup complete");
            });
        }
        return () => {
            for (const d of disposals) {
                if (typeof d !== "function") {
                    d.unsubscribe();
                } else {
                    d();
                }
            }
            console.log("Painter unmounted");
        };
    });

    onLayoutChange(() => {
        const htmlCanvas = getCanvas();
        if (!htmlCanvas) return;
        canvasInfo = getCanvasInfo({
            canvasOffset: getCanvasOffset(htmlCanvas),
            canvasResolution,
        });
        canvasInfo_.set(canvasInfo);
    });
};

const getCanvasOffset = (canvas: HTMLCanvasElement): Vec2 => {
    return new Vec2(canvas.offsetLeft, canvas.offsetTop);
};

const createUpdateThemeEffect = () => {
    let prevTheme: Theme.Theme | null = null;
    return (nextTheme: Theme.Theme) => {
        if (prevTheme === null) {
            Theme.updateAll(nextTheme);
        } else {
            Theme.updateDiff(prevTheme, nextTheme);
        }
        prevTheme = nextTheme;
    };
};
const updateTheme = createUpdateThemeEffect();

const onLayoutChange = (onResize: () => void): void => {
    afterUpdate(() => {
        onResize();
    });
    onMount(() => {
        window.addEventListener("resize", onResize);
        return () => {
            window.removeEventListener("resize", onResize);
        };
    });
};
