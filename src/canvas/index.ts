import * as Layers from "./layers"
import * as Tools from "../tools"
import * as Input from "./input"
import * as keymapping from "./keymapping"
import * as Camera from "../tools/camera"
import * as Rng from "../rng"
import * as Theme from "../ui/theme"
import * as Context from "./context"
import { BrushPoint } from "./brushShader"
import { Stack } from "../collections"
import { Vec2, PerfTracker, turn, Tagged, tagged } from "../util"

export type CanvasMsg =
    | Tagged<"OnFrame", number>
    | Tagged<"OnClick", Input.PointerInput>
    | Tagged<"OnRelease", Input.PointerInput>
    | Tagged<"OnDrag", readonly Input.PointerInput[]>
    | Tagged<"OnKeyboard", keymapping.KeyInput>
    | Tagged<"RandomizeTheme">
    | Tagged<"ToggleHighlightRenderBlocks">
    | Tagged<"ToolMsg", Tools.ToolMsg>
    | Tagged<"LayersMsg", Layers.Msg>

export type Effect =
    | Tagged<"NoOp">
    | Tagged<"Batch", readonly Effect[]>
    | Tagged<"RenderFrame", { brushPoints: readonly BrushPoint[]; config: Config }>
    | Tagged<"AddBrushPoints", readonly BrushPoint[]>
    | Tagged<"EndStroke", readonly BrushPoint[]>

const NOOP_EFFECT: Effect = tagged("NoOp")

export class Sender {
    readonly tool: Tools.Sender
    readonly layer: Layers.Sender

    constructor(private sendMessage: (msg: CanvasMsg) => void) {
        this.tool = new Tools.Sender((msg) => sendMessage(tagged("ToolMsg", msg)))
        this.layer = new Layers.Sender((msg) => sendMessage(tagged("LayersMsg", msg)))
    }
    onFrame = (timeMs: number) => this.sendMessage(tagged("OnFrame", timeMs))
    onClick = (input: Input.PointerInput) => this.sendMessage(tagged("OnClick", input))
    onRelease = (input: Input.PointerInput) => this.sendMessage(tagged("OnRelease", input))
    onDrag = (inputs: readonly Input.PointerInput[]) => {
        if (inputs.length === 0) {
            const errorMsg = "Expected inputs be be 1 or greater"
            console.error(errorMsg, inputs)
            throw { [errorMsg]: inputs }
        }
        this.sendMessage(tagged("OnDrag", inputs))
    }
    onKeyboard = (input: keymapping.KeyInput) => this.sendMessage(tagged("OnKeyboard", input))
    randomizeTheme = () => this.sendMessage(tagged("RandomizeTheme"))
    toggleHighlightRenderBlocks = () => this.sendMessage(tagged("ToggleHighlightRenderBlocks"))
}

export interface Config {
    readonly theme: Theme.Theme
    readonly tool: Tools.Config
    readonly layers: Layers.State
    readonly highlightRenderBlocks: boolean
    readonly keyboard: keymapping.KeyBindingSystem<CanvasMsg>
}

export interface State {
    readonly themeRng: Rng.Seed
    readonly tool: Tools.State
    readonly hasPressedDown: boolean
}

export function initState(): [Config, State] {
    const [theme, themeRng] = Theme.random(Rng.XorshiftSeed.create(145264772))

    const createKey = keymapping.KeyInput.createKey

    const config: Config = {
        theme,
        tool: Tools.init,
        layers: Layers.State.init(),
        highlightRenderBlocks: false,
        keyboard: {
            layers: Stack.empty<keymapping.KeyBindLayer<CanvasMsg>>().cons({
                [createKey({ code: "KeyB" })]: {
                    msg: tagged("ToolMsg", tagged("SetToolMsg", "Brush") as Tools.ToolMsg),
                    passive: false,
                },
                [createKey({ code: "KeyE" })]: {
                    msg: tagged("ToolMsg", tagged("SetToolMsg", "Eraser") as Tools.ToolMsg),
                    passive: false,
                },
                [createKey({ code: "KeyZ" })]: {
                    msg: tagged("ToolMsg", tagged("SetToolMsg", "Zoom") as Tools.ToolMsg),
                    passive: false,
                },
                [createKey({ code: "KeyM" })]: {
                    msg: tagged("ToolMsg", tagged("SetToolMsg", "Move") as Tools.ToolMsg),
                    passive: false,
                },
                [createKey({ code: "KeyR" })]: {
                    msg: tagged("ToolMsg", tagged("SetToolMsg", "Rotate") as Tools.ToolMsg),
                    passive: false,
                },
                [createKey({ code: "KeyP" })]: {
                    msg: tagged("ToggleHighlightRenderBlocks"),
                    passive: false,
                },
            }),
        },
    }
    const state: State = {
        themeRng,
        tool: Tools.initEphemeral(),
        hasPressedDown: false,
    }
    return [config, state]
}

export interface CanvasInfo {
    readonly offset: Vec2
    readonly resolution: Vec2
    readonly halfResoution: Vec2
}

export interface TransformedPointerInput {
    readonly x: number
    readonly y: number
    readonly pressure: number
    readonly originalX: number
    readonly originalY: number
    readonly time: number
}

function pointerToBrushInput(
    canvasInfo: CanvasInfo,
    camera: Camera.Config,
    input: Input.PointerInput
): TransformedPointerInput {
    const point = new Vec2(input.x, input.y)
        .subtract(canvasInfo.offset)
        .subtractScalars(camera.offsetX, camera.offsetY)
        .subtract(canvasInfo.halfResoution)
        .multiplyScalar(1 / camera.zoomPct)

    const { x, y } = turn(-camera.rotateTurns, Vec2.zeroes, point).add(canvasInfo.halfResoution)

    return {
        x,
        y,
        pressure: input.pressure,
        time: input.time,
        originalX: input.x,
        originalY: input.y,
    }
}
function pointersToBrushInputs(
    canvasInfo: CanvasInfo,
    camera: Camera.Config,
    inputs: readonly Input.PointerInput[]
): TransformedPointerInput[] {
    const arr = new Array<TransformedPointerInput>(inputs.length)
    for (let i = 0; i < inputs.length; i++) {
        arr[i] = pointerToBrushInput(canvasInfo, camera, inputs[i])
    }
    return arr
}

export function update(
    canvasInfo: CanvasInfo,
    config: Config,
    state: State,
    msg: CanvasMsg
): readonly [Config, State, Effect] {
    switch (msg.tag) {
        case "OnFrame": {
            const [nextToolEphemeral, brushPoints] = Tools.onFrame(config.tool, state.tool, msg.val)
            const effect: Effect = tagged("RenderFrame", { brushPoints, config })
            return [config, { ...state, tool: nextToolEphemeral }, effect]
        }
        case "OnClick": {
            const [nextTool, nextToolEphemeral, brushPoints] = Tools.onClick(
                config.tool,
                state.tool,
                pointerToBrushInput(canvasInfo, config.tool.camera, msg.val)
            )
            const nextConfig: Config = { ...config, tool: nextTool }
            const nextState: State = { ...state, hasPressedDown: true, tool: nextToolEphemeral }
            const effect: Effect = tagged("AddBrushPoints", brushPoints)
            return [nextConfig, nextState, effect]
        }
        case "OnRelease": {
            const [nextTool, nextToolEphemeral, brushPoints] = Tools.onRelease(
                config.tool,
                state.tool,
                pointerToBrushInput(canvasInfo, config.tool.camera, msg.val)
            )
            const nextConfig: Config = { ...config, tool: nextTool }
            const nextState: State = { ...state, hasPressedDown: false, tool: nextToolEphemeral }
            const effect: Effect = tagged("EndStroke", brushPoints)
            return [nextConfig, nextState, effect]
        }
        case "OnDrag": {
            if (!state.hasPressedDown) {
                return [config, state, NOOP_EFFECT]
            }
            const [nextTool, nextToolEphemeral, brushPoints] = Tools.onDrag(
                config.tool,
                state.tool,
                pointersToBrushInputs(canvasInfo, config.tool.camera, msg.val)
            )
            const nextConfig: Config = { ...config, tool: nextTool }
            const nextState: State = { ...state, tool: nextToolEphemeral }
            const effect: Effect = tagged("AddBrushPoints", brushPoints)
            return [nextConfig, nextState, effect]
        }
        case "OnKeyboard": {
            const msgs = keymapping.handleKeyCode(config.keyboard, msg.val)

            const effects: Effect[] = []
            let effect: Effect = NOOP_EFFECT
            let nextConfig: Config = config
            let nextState: State = state
            for (let i = 0; i < msgs.length; i++) {
                ;[nextConfig, nextState, effect] = update(
                    canvasInfo,
                    nextConfig,
                    nextState,
                    msgs[i]
                )
                if (effect.tag !== "NoOp") {
                    effects.push(effect)
                }
            }
            if (effects.length > 0) {
                effect = tagged("Batch", effects)
            }
            return [nextConfig, nextState, effect]
        }
        case "RandomizeTheme": {
            const [theme, themeRng] = Theme.random(state.themeRng)
            const nextConfig: Config = { ...config, theme }
            const nextState: State = { ...state, themeRng }
            return [nextConfig, nextState, NOOP_EFFECT]
        }
        case "ToggleHighlightRenderBlocks": {
            const nextConfig: Config = {
                ...config,
                highlightRenderBlocks: !config.highlightRenderBlocks,
            }
            return [nextConfig, state, NOOP_EFFECT]
        }
        case "ToolMsg": {
            const nextConfig: Config = { ...config, tool: Tools.update(config.tool, msg.val) }
            return [nextConfig, state, NOOP_EFFECT]
        }
        case "LayersMsg": {
            const nextConfig: Config = { ...config, layers: config.layers.update(msg.val) }
            return [nextConfig, state, NOOP_EFFECT]
        }
        default:
            const never: never = msg
            throw { "unexpected msg": msg }
    }
}

export interface Hooks {
    // readonly onCanvasSnapshot: (snapshot: Snapshot) => void
    // readonly onLayerSnapshot: (snapshot: Snapshot, layerId: number) => void
    readonly onStats: (stats: readonly PerfTracker.Sample[]) => void
    readonly onWebglContextCreated: (gl: WebGLRenderingContext) => void
}

export class Canvas {
    static create(canvas: HTMLCanvasElement, hooks: Hooks): Canvas | null {
        const context = Context.create(canvas)
        if (context.isOk()) {
            if (process.env.NODE_ENV === "development") {
                hooks.onWebglContextCreated(context.value[1])
            }
            return new Canvas(new Vec2(canvas.width, canvas.height), hooks, context.value[0])
        }
        console.error("Error in Context setup:", context.value)
        return null
    }

    private readonly perfTracker: PerfTracker.PerfTracker

    private constructor(
        private readonly resolution: Vec2,
        private readonly hooks: Hooks,
        private readonly context: Context.Context
    ) {
        this.perfTracker = new PerfTracker.PerfTracker({
            maxSamples: 50,
            onSamples: this.hooks.onStats,
        })
    }

    handle(eff: Effect): void {
        switch (eff.tag) {
            case "NoOp":
                return
            case "Batch": {
                const effects = eff.val
                for (let i = 0; i < effects.length; i++) {
                    this.handle(effects[i])
                }
                return
            }
            case "RenderFrame": {
                const { brushPoints, config } = eff.val
                this.perfTracker.start()
                this.context.addBrushPoints(brushPoints)
                this.context.render({
                    blendMode: Tools.getBlendMode(config.tool),
                    nextLayers: config.layers.split(),
                    resolution: this.resolution,
                    brush: { softness: Tools.getSoftness(config.tool) },
                    currentTime: performance.now(),
                    highlightRenderBlocks: config.highlightRenderBlocks,
                })
                this.perfTracker.end()
                return
            }
            case "AddBrushPoints": {
                this.context.addBrushPoints(eff.val)
                return
            }
            case "EndStroke": {
                this.context.addBrushPoints(eff.val)
                this.context.endStroke()
                return
            }
            default:
                const never: never = eff
                throw { "unexpected effect": eff }
        }
    }

    dispose(): void {
        this.context.dispose()
    }
}
