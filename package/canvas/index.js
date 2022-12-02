import * as Layers from "./layers.js";
import * as Tools from "../tools/index.js";
import * as keymapping from "./keymapping.js";
import * as Rng from "../rng/index.js";
import * as Theme from "../ui/theme.js";
import * as Context from "./context.js";
import { Stack } from "../collections/index.js";
import { Vec2, PerfTracker, turn, tagged } from "../util/index.js";
const NOOP_EFFECT = tagged("NoOp");
export class Sender {
    sendMessage;
    tool;
    layer;
    constructor(sendMessage) {
        this.sendMessage = sendMessage;
        this.tool = new Tools.Sender((msg) => sendMessage(tagged("ToolMsg", msg)));
        this.layer = new Layers.Sender((msg) => sendMessage(tagged("LayersMsg", msg)));
    }
    onFrame = (timeMs) => this.sendMessage(tagged("OnFrame", timeMs));
    onClick = (input) => this.sendMessage(tagged("OnClick", input));
    onRelease = (input) => this.sendMessage(tagged("OnRelease", input));
    onDrag = (inputs) => {
        if (inputs.length === 0) {
            const errorMsg = "Expected inputs be be 1 or greater";
            console.error(errorMsg, inputs);
            throw { [errorMsg]: inputs };
        }
        this.sendMessage(tagged("OnDrag", inputs));
    };
    onKeyboard = (input) => this.sendMessage(tagged("OnKeyboard", input));
    randomizeTheme = () => this.sendMessage(tagged("RandomizeTheme"));
    toggleHighlightRenderBlocks = () => this.sendMessage(tagged("ToggleHighlightRenderBlocks"));
    toggleDisplayStats = () => this.sendMessage(tagged("ToggleDisplayStats"));
}
export function initState() {
    const [theme, themeRng] = Theme.random(Rng.XorshiftSeed.create(145264772));
    const createKey = keymapping.KeyInput.createKey;
    const config = {
        theme,
        tool: Tools.init,
        layers: Layers.State.init(),
        highlightRenderBlocks: false,
        displayStats: false,
        keyboard: {
            layers: Stack.empty().cons({
                [createKey({ code: "KeyB" })]: {
                    msg: tagged("ToolMsg", tagged("SetToolMsg", "Brush")),
                    passive: false,
                },
                [createKey({ code: "KeyE" })]: {
                    msg: tagged("ToolMsg", tagged("SetToolMsg", "Eraser")),
                    passive: false,
                },
                [createKey({ code: "KeyZ" })]: {
                    msg: tagged("ToolMsg", tagged("SetToolMsg", "Zoom")),
                    passive: false,
                },
                [createKey({ code: "KeyM" })]: {
                    msg: tagged("ToolMsg", tagged("SetToolMsg", "Move")),
                    passive: false,
                },
                [createKey({ code: "KeyR" })]: {
                    msg: tagged("ToolMsg", tagged("SetToolMsg", "Rotate")),
                    passive: false,
                },
                [createKey({ code: "KeyP" })]: {
                    msg: tagged("ToggleHighlightRenderBlocks"),
                    passive: false,
                },
            }),
        },
    };
    const state = {
        themeRng,
        tool: Tools.initEphemeral(),
        hasPressedDown: false,
    };
    return [config, state];
}
function pointerToBrushInput(canvasInfo, camera, input) {
    const point = new Vec2(input.x, input.y)
        .subtract(canvasInfo.offset)
        .subtractScalars(camera.offsetX, camera.offsetY)
        .subtract(canvasInfo.halfResoution)
        .multiplyScalar(1 / camera.zoomPct);
    const { x, y } = turn(-camera.rotateTurns, Vec2.zeroes, point).add(canvasInfo.halfResoution);
    return {
        x,
        y,
        pressure: input.pressure,
        time: input.time,
        originalX: input.x,
        originalY: input.y,
    };
}
function pointersToBrushInputs(canvasInfo, camera, inputs) {
    const arr = new Array(inputs.length);
    for (let i = 0; i < inputs.length; i++) {
        arr[i] = pointerToBrushInput(canvasInfo, camera, inputs[i]);
    }
    return arr;
}
export function update(canvasInfo, config, state, msg) {
    switch (msg.tag) {
        case "OnFrame": {
            const [nextToolEphemeral, brushPoints] = Tools.onFrame(config.tool, state.tool, msg.val);
            const effect = tagged("RenderFrame", { brushPoints, config });
            return [config, { ...state, tool: nextToolEphemeral }, effect];
        }
        case "OnClick": {
            const [nextTool, nextToolEphemeral, brushPoints] = Tools.onClick(config.tool, state.tool, pointerToBrushInput(canvasInfo, config.tool.camera, msg.val));
            const nextConfig = { ...config, tool: nextTool };
            const nextState = { ...state, hasPressedDown: true, tool: nextToolEphemeral };
            const effect = tagged("AddBrushPoints", brushPoints);
            return [nextConfig, nextState, effect];
        }
        case "OnRelease": {
            const [nextTool, nextToolEphemeral, brushPoints] = Tools.onRelease(config.tool, state.tool, pointerToBrushInput(canvasInfo, config.tool.camera, msg.val));
            const nextConfig = { ...config, tool: nextTool };
            const nextState = { ...state, hasPressedDown: false, tool: nextToolEphemeral };
            const effect = tagged("EndStroke", brushPoints);
            return [nextConfig, nextState, effect];
        }
        case "OnDrag": {
            if (!state.hasPressedDown) {
                return [config, state, NOOP_EFFECT];
            }
            const [nextTool, nextToolEphemeral, brushPoints] = Tools.onDrag(config.tool, state.tool, pointersToBrushInputs(canvasInfo, config.tool.camera, msg.val));
            const nextConfig = { ...config, tool: nextTool };
            const nextState = { ...state, tool: nextToolEphemeral };
            const effect = tagged("AddBrushPoints", brushPoints);
            return [nextConfig, nextState, effect];
        }
        case "OnKeyboard": {
            const msgs = keymapping.handleKeyCode(config.keyboard, msg.val);
            const effects = [];
            let effect = NOOP_EFFECT;
            let nextConfig = config;
            let nextState = state;
            for (let i = 0; i < msgs.length; i++) {
                [nextConfig, nextState, effect] = update(canvasInfo, nextConfig, nextState, msgs[i]);
                if (effect.tag !== "NoOp") {
                    effects.push(effect);
                }
            }
            if (effects.length > 0) {
                effect = tagged("Batch", effects);
            }
            return [nextConfig, nextState, effect];
        }
        case "RandomizeTheme": {
            const [theme, themeRng] = Theme.random(state.themeRng);
            const nextConfig = { ...config, theme };
            const nextState = { ...state, themeRng };
            return [nextConfig, nextState, NOOP_EFFECT];
        }
        case "ToggleHighlightRenderBlocks": {
            const nextConfig = {
                ...config,
                highlightRenderBlocks: !config.highlightRenderBlocks,
            };
            return [nextConfig, state, NOOP_EFFECT];
        }
        case "ToggleDisplayStats": {
            const nextConfig = {
                ...config,
                displayStats: !config.displayStats,
            };
            return [nextConfig, state, NOOP_EFFECT];
        }
        case "ToolMsg": {
            const nextConfig = { ...config, tool: Tools.update(config.tool, msg.val) };
            return [nextConfig, state, NOOP_EFFECT];
        }
        case "LayersMsg": {
            const nextConfig = { ...config, layers: config.layers.update(msg.val) };
            return [nextConfig, state, NOOP_EFFECT];
        }
        default: {
            const never = msg;
            throw { "unexpected msg": msg };
        }
    }
}
export class Canvas {
    resolution;
    hooks;
    context;
    static create(canvas, hooks) {
        const context = Context.create(canvas);
        if (context.isOk()) {
            hooks.onWebglContextCreated(context.value[1]);
            return new Canvas(new Vec2(canvas.width, canvas.height), hooks, context.value[0]);
        }
        console.error("Error in Context setup:", context.value);
        return null;
    }
    perfTracker;
    constructor(resolution, hooks, context) {
        this.resolution = resolution;
        this.hooks = hooks;
        this.context = context;
        this.perfTracker = new PerfTracker.PerfTracker({
            maxSamples: 50,
            onSamples: this.hooks.onStats,
        });
    }
    handle(eff) {
        switch (eff.tag) {
            case "NoOp":
                return;
            case "Batch": {
                const effects = eff.val;
                for (let i = 0; i < effects.length; i++) {
                    this.handle(effects[i]);
                }
                return;
            }
            case "RenderFrame": {
                const { brushPoints, config } = eff.val;
                this.perfTracker.start();
                this.context.addBrushPoints(brushPoints);
                this.context.render({
                    blendMode: Tools.getBlendMode(config.tool),
                    nextLayers: config.layers.split(),
                    resolution: this.resolution,
                    brush: { softness: Tools.getSoftness(config.tool) },
                    currentTime: performance.now(),
                    highlightRenderBlocks: config.highlightRenderBlocks,
                });
                this.perfTracker.end();
                return;
            }
            case "AddBrushPoints": {
                this.context.addBrushPoints(eff.val);
                return;
            }
            case "EndStroke": {
                this.context.addBrushPoints(eff.val);
                this.context.endStroke();
                return;
            }
            default: {
                const never = eff;
                throw { "unexpected effect": eff };
            }
        }
    }
    dispose() {
        this.context.dispose();
    }
}
