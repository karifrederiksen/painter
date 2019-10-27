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
import { Vec2, PerfTracker, turn } from "../util"

export type CanvasMsg =
    | OnFrame
    | OnClick
    | OnRelease
    | OnDrag
    | OnKeyboard
    | RandomizeTheme
    | ToolMsg
    | LayersMsg

export const enum CanvasMsgType {
    OnFrame,
    OnClick,
    OnRelease,
    OnDrag,
    OnKeyboard,
    RandomizeTheme,
    ToolMsg,
    LayersMsg,
}

class OnFrame {
    readonly type = CanvasMsgType.OnFrame as const
    private _: void
    constructor(readonly ms: number) {}
}
class OnClick {
    readonly type = CanvasMsgType.OnClick as const
    private _: void
    constructor(readonly input: Input.PointerInput) {}
}
class OnRelease {
    readonly type = CanvasMsgType.OnRelease as const
    private _: void
    constructor(readonly input: Input.PointerInput) {}
}
class OnDrag {
    readonly type = CanvasMsgType.OnDrag as const
    private _: void
    constructor(readonly inputs: readonly Input.PointerInput[]) {}
}
class OnKeyboard {
    readonly type = CanvasMsgType.OnKeyboard as const
    private _: void
    constructor(readonly input: keymapping.KeyInput) {}
}
class RandomizeTheme {
    readonly type = CanvasMsgType.RandomizeTheme as const
    private _: void
    constructor() {}
}
class ToolMsg {
    readonly type: CanvasMsgType.ToolMsg = CanvasMsgType.ToolMsg
    private _: void
    constructor(readonly msg: Tools.ToolMsg) {}
}
class LayersMsg {
    readonly type: CanvasMsgType.LayersMsg = CanvasMsgType.LayersMsg
    private _: void
    constructor(readonly msg: Layers.Msg) {}
}

export const enum EffectType {
    NoOp,
    Batch,
    RenderFrame,
    AddBrushPoints,
    EndStroke,
}
export type Effect =
    | NoOpEffect
    | BatchEffect
    | RenderFrameEffect
    | AddBrushPointsEffect
    | EndStrokeEffect

class NoOpEffect {
    static readonly value = new NoOpEffect()
    readonly type = EffectType.NoOp as const
    private _: void
    private constructor() {}
}

class BatchEffect {
    readonly type = EffectType.Batch as const
    private _: void
    constructor(readonly effects: readonly Effect[]) {}
}

class RenderFrameEffect {
    readonly type = EffectType.RenderFrame as const
    private _: void
    constructor(readonly brushPoints: readonly BrushPoint[], readonly config: Config) {}
}
class AddBrushPointsEffect {
    readonly type = EffectType.AddBrushPoints as const
    private _: void
    constructor(readonly brushPoints: readonly BrushPoint[]) {}
}
class EndStrokeEffect {
    readonly type = EffectType.EndStroke as const
    private _: void
    constructor(readonly brushPoints: readonly BrushPoint[]) {}
}

export class MsgSender {
    readonly tool: Tools.MsgSender
    readonly layer: Layers.MsgSender

    readonly onFrame = (timeMs: number): void => {
        this.sendMessage(new OnFrame(timeMs))
    }
    readonly onClick = (input: Input.PointerInput): void => {
        this.sendMessage(new OnClick(input))
    }
    readonly onRelease = (input: Input.PointerInput): void => {
        this.sendMessage(new OnRelease(input))
    }
    readonly onDrag = (inputs: readonly Input.PointerInput[]): void => {
        if (inputs.length === 0) {
            const errorMsg = "Expected inputs be be 1 or greater"
            console.error(errorMsg, inputs)
            throw { [errorMsg]: inputs }
        }
        this.sendMessage(new OnDrag(inputs))
    }
    readonly onKeyboard = (input: keymapping.KeyInput): void => {
        this.sendMessage(new OnKeyboard(input))
    }
    readonly randomizeTheme = (): void => {
        this.sendMessage(new RandomizeTheme())
    }

    constructor(private sendMessage: (msg: CanvasMsg) => void) {
        this.tool = new Tools.MsgSender(msg => sendMessage(new ToolMsg(msg)))
        this.layer = new Layers.MsgSender(msg => sendMessage(new LayersMsg(msg)))
    }
}

export interface Config {
    readonly theme: Theme.Theme
    readonly tool: Tools.Config
    readonly layers: Layers.State
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
        keyboard: {
            layers: Stack.empty<keymapping.KeyBindLayer<CanvasMsg>>().cons({
                [createKey({ code: "KeyB" })]: {
                    msg: new ToolMsg(new Tools.SetToolMsg(Tools.ToolType.Brush)),
                    passive: false,
                },
                [createKey({ code: "KeyE" })]: {
                    msg: new ToolMsg(new Tools.SetToolMsg(Tools.ToolType.Eraser)),
                    passive: false,
                },
                [createKey({ code: "KeyZ" })]: {
                    msg: new ToolMsg(new Tools.SetToolMsg(Tools.ToolType.Zoom)),
                    passive: false,
                },
                [createKey({ code: "KeyM" })]: {
                    msg: new ToolMsg(new Tools.SetToolMsg(Tools.ToolType.Move)),
                    passive: false,
                },
                [createKey({ code: "KeyR" })]: {
                    msg: new ToolMsg(new Tools.SetToolMsg(Tools.ToolType.Rotate)),
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
    switch (msg.type) {
        case CanvasMsgType.OnFrame: {
            const [nextToolEphemeral, brushPoints] = Tools.onFrame(config.tool, state.tool, msg.ms)
            const effect = new RenderFrameEffect(brushPoints, config)
            return [config, { ...state, tool: nextToolEphemeral }, effect]
        }
        case CanvasMsgType.OnClick: {
            const [nextTool, nextToolEphemeral, brushPoints] = Tools.onClick(
                config.tool,
                state.tool,
                pointerToBrushInput(canvasInfo, config.tool.camera, msg.input)
            )
            const nextConfig: Config = { ...config, tool: nextTool }
            const nextState: State = { ...state, hasPressedDown: true, tool: nextToolEphemeral }
            const effect = new AddBrushPointsEffect(brushPoints)
            return [nextConfig, nextState, effect]
        }
        case CanvasMsgType.OnRelease: {
            const [nextTool, nextToolEphemeral, brushPoints] = Tools.onRelease(
                config.tool,
                state.tool,
                pointerToBrushInput(canvasInfo, config.tool.camera, msg.input)
            )
            const nextConfig: Config = { ...config, tool: nextTool }
            const nextState: State = { ...state, hasPressedDown: false, tool: nextToolEphemeral }
            const effect = new EndStrokeEffect(brushPoints)
            return [nextConfig, nextState, effect]
        }
        case CanvasMsgType.OnDrag: {
            if (!state.hasPressedDown) {
                return [config, state, NoOpEffect.value]
            }
            const [nextTool, nextToolEphemeral, brushPoints] = Tools.onDrag(
                config.tool,
                state.tool,
                pointersToBrushInputs(canvasInfo, config.tool.camera, msg.inputs)
            )
            const nextConfig: Config = { ...config, tool: nextTool }
            const nextState: State = { ...state, tool: nextToolEphemeral }
            const effect = new AddBrushPointsEffect(brushPoints)
            return [nextConfig, nextState, effect]
        }
        case CanvasMsgType.OnKeyboard: {
            const msgs = keymapping.handleKeyCode(config.keyboard, msg.input)

            const effects: Effect[] = []
            let effect: Effect = NoOpEffect.value
            let nextConfig: Config = config
            let nextState: State = state
            for (let i = 0; i < msgs.length; i++) {
                ;[nextConfig, nextState, effect] = update(
                    canvasInfo,
                    nextConfig,
                    nextState,
                    msgs[i]
                )
                if (effect.type !== EffectType.NoOp) {
                    effects.push(effect)
                }
            }
            if (effects.length > 0) {
                effect = new BatchEffect(effects)
            }
            return [nextConfig, nextState, effect]
        }
        case CanvasMsgType.RandomizeTheme: {
            const [theme, themeRng] = Theme.random(state.themeRng)
            const nextConfig: Config = { ...config, theme }
            const nextState: State = { ...state, themeRng }
            return [nextConfig, nextState, NoOpEffect.value]
        }
        case CanvasMsgType.ToolMsg: {
            const nextConfig: Config = { ...config, tool: Tools.update(config.tool, msg.msg) }
            return [nextConfig, state, NoOpEffect.value]
        }
        case CanvasMsgType.LayersMsg: {
            const nextConfig: Config = { ...config, layers: config.layers.update(msg.msg) }
            return [nextConfig, state, NoOpEffect.value]
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

    private readonly perfTracker: PerfTracker

    private constructor(
        private readonly resolution: Vec2,
        private readonly hooks: Hooks,
        private readonly context: Context.Context
    ) {
        this.perfTracker = new PerfTracker({
            maxSamples: 50,
            onSamples: this.hooks.onStats,
        })
    }

    handle(eff: Effect): void {
        switch (eff.type) {
            case EffectType.NoOp:
                return
            case EffectType.Batch: {
                const { effects } = eff
                for (let i = 0; i < effects.length; i++) {
                    this.handle(effects[i])
                }
                return
            }
            case EffectType.RenderFrame: {
                this.perfTracker.start()
                this.context.addBrushPoints(eff.brushPoints)
                this.context.render({
                    blendMode: Tools.getBlendMode(eff.config.tool),
                    nextLayers: eff.config.layers.split(),
                    resolution: this.resolution,
                    brush: { softness: Tools.getSoftness(eff.config.tool) },
                })
                this.perfTracker.end()
                return
            }
            case EffectType.AddBrushPoints: {
                this.context.addBrushPoints(eff.brushPoints)
                return
            }
            case EffectType.EndStroke: {
                this.context.addBrushPoints(eff.brushPoints)
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
