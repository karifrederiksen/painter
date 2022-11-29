import { writable } from "svelte/store";
import * as Canvas from "../canvas";
import { afterUpdate, onMount } from "svelte";
import * as Input from "../canvas/input";
import * as Keymapping from "../canvas/keymapping";
import * as Setup from "./setup";
import { FrameStream, Store, Vec2 } from "../util";
import { samples } from "./debugging";
import * as Theme from "./theme";
export const canvasResolution = new Vec2(800, 800);
const [initialState, initialEphemeral] = Canvas.initState();
export const getCanvasInfo = ({ canvasOffset, canvasResolution, }) => {
    return {
        resolution: canvasResolution,
        halfResoution: canvasResolution.multiplyScalar(0.5),
        offset: canvasOffset,
    };
};
export const initialCanvasInfo = getCanvasInfo({
    canvasOffset: new Vec2(initialState.tool.camera.offsetX, initialState.tool.camera.offsetY),
    canvasResolution,
});
// eslint-disable-next-line @typescript-eslint/no-empty-function
const noopSender = new Canvas.Sender((x) => { });
const debuggingGl_ = writable();
const state_ = writable(initialState);
const canvasSender_ = writable(noopSender);
const canvasInfo_ = writable(initialCanvasInfo);
const canvasEphemeral_ = writable(initialEphemeral);
export const debuggingGl = debuggingGl_;
export const canvasState = state_;
export const canvasSender = canvasSender_;
export const canvasInfo = canvasInfo_;
export const canvasEphemeral = canvasEphemeral_;
export const onPageMount = (getCanvas) => {
    let canvasInfo = getCanvasInfo({
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
        const store_ = Store.create({
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
        const disposals = [];
        const canvasObs = Input.listen(htmlCanvas);
        disposals.push(canvasObs.click.subscribe(sender.onClick));
        disposals.push(canvasObs.release.subscribe(sender.onRelease));
        disposals.push(canvasObs.move.subscribe(() => {
            /**/
        }));
        disposals.push(canvasObs.drag.subscribe(sender.onDrag));
        disposals.push(Keymapping.listen({
            handle: sender.onKeyboard,
        }));
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
                }
                else {
                    d();
                }
            }
            console.log("Painter unmounted");
        };
    });
    onLayoutChange(() => {
        const htmlCanvas = getCanvas();
        if (!htmlCanvas)
            return;
        canvasInfo = getCanvasInfo({
            canvasOffset: getCanvasOffset(htmlCanvas),
            canvasResolution,
        });
        canvasInfo_.set(canvasInfo);
    });
};
const getCanvasOffset = (canvas) => {
    return new Vec2(canvas.offsetLeft, canvas.offsetTop);
};
const createUpdateThemeEffect = () => {
    let prevTheme = null;
    return (nextTheme) => {
        if (prevTheme === null) {
            Theme.updateAll(nextTheme);
        }
        else {
            Theme.updateDiff(prevTheme, nextTheme);
        }
        prevTheme = nextTheme;
    };
};
const updateTheme = createUpdateThemeEffect();
const onLayoutChange = (onResize) => {
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
