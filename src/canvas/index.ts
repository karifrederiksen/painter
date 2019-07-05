import * as Layers from "./layers"
import * as Tools from "../tools"
import * as Input from "./input"
import * as Camera from "../tools/camera"
import * as Rng from "../rng"
import * as Theme from "../ui/theme"
import * as Context from "./context"
import { BrushPoint } from "./brushShader"
import { Vec2, PerfTracker, turn } from "../util"

export type CanvasMsg =
    | OnFrame
    | OnClick
    | OnRelease
    | OnDrag
    | RandomizeTheme
    | ToolMsg
    | LayersMsg

export const enum CanvasMsgType {
    OnFrame,
    OnClick,
    OnRelease,
    OnDrag,
    RandomizeTheme,
    ToolMsg,
    LayersMsg,
}

class OnFrame {
    readonly type: CanvasMsgType.OnFrame = CanvasMsgType.OnFrame
    private nominal: void
    constructor(readonly ms: number) {}
}
class OnClick {
    readonly type: CanvasMsgType.OnClick = CanvasMsgType.OnClick
    private nominal: void
    constructor(readonly input: Input.PointerInput) {}
}
class OnRelease {
    readonly type: CanvasMsgType.OnRelease = CanvasMsgType.OnRelease
    private nominal: void
    constructor(readonly input: Input.PointerInput) {}
}
class OnDrag {
    readonly type: CanvasMsgType.OnDrag = CanvasMsgType.OnDrag
    private nominal: void
    constructor(readonly inputs: readonly Input.PointerInput[]) {}
}
class RandomizeTheme {
    readonly type: CanvasMsgType.RandomizeTheme = CanvasMsgType.RandomizeTheme
    private nominal: void
    constructor() {}
}
class ToolMsg {
    readonly type: CanvasMsgType.ToolMsg = CanvasMsgType.ToolMsg
    private nominal: void
    constructor(readonly msg: Tools.ToolMsg) {}
}
class LayersMsg {
    readonly type: CanvasMsgType.LayersMsg = CanvasMsgType.LayersMsg
    private nominal: void
    constructor(readonly msg: Layers.Msg) {}
}

export const enum EffectType {
    NoOpEffect,
    FrameEffect,
    BrushPointsEffect,
    ReleaseEffect,
}
export type Effect = NoOpEffect | FrameEffect | BrushPointsEffect | ReleaseEffect

class NoOpEffect {
    static readonly value = new NoOpEffect()
    readonly type: EffectType.NoOpEffect = EffectType.NoOpEffect
    private nominal: void
    private constructor() {}
}

class FrameEffect {
    readonly type: EffectType.FrameEffect = EffectType.FrameEffect
    private nominal: void
    constructor(readonly brushPoints: readonly BrushPoint[], readonly state: Config) {}
}
class BrushPointsEffect {
    readonly type: EffectType.BrushPointsEffect = EffectType.BrushPointsEffect
    private nominal: void
    constructor(readonly brushPoints: readonly BrushPoint[]) {}
}
class ReleaseEffect {
    readonly type: EffectType.ReleaseEffect = EffectType.ReleaseEffect
    private nominal: void
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
}

export interface State {
    readonly themeRng: Rng.Seed
    readonly tool: Tools.State
    readonly hasPressedDown: boolean
}

export function initState(): [Config, State] {
    const [theme, themeRng] = Theme.random(Rng.XorshiftSeed.create(145264772))

    const config: Config = {
        theme,
        tool: Tools.init,
        layers: Layers.State.init(),
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
    state: Config,
    ephemeral: State,
    msg: CanvasMsg
): readonly [Config, State, Effect] {
    switch (msg.type) {
        case CanvasMsgType.OnFrame: {
            const [nextToolEphemeral, brushPoints] = Tools.onFrame(
                state.tool,
                ephemeral.tool,
                msg.ms
            )
            const effect = new FrameEffect(brushPoints, state)
            return [state, { ...ephemeral, tool: nextToolEphemeral }, effect]
        }
        case CanvasMsgType.OnClick: {
            const [nextTool, nextToolEphemeral, brushPoints] = Tools.onClick(
                state.tool,
                ephemeral.tool,
                pointerToBrushInput(canvasInfo, state.tool.camera, msg.input)
            )
            const nextState = { ...state, tool: nextTool }
            const nextEphemeral = { ...ephemeral, hasPressedDown: true, tool: nextToolEphemeral }
            const effect = new BrushPointsEffect(brushPoints)
            return [nextState, nextEphemeral, effect]
        }
        case CanvasMsgType.OnRelease: {
            const [nextTool, nextToolEphemeral, brushPoints] = Tools.onRelease(
                state.tool,
                ephemeral.tool,
                pointerToBrushInput(canvasInfo, state.tool.camera, msg.input)
            )
            const nextState = { ...state, tool: nextTool }
            const nextEphemeral = { ...ephemeral, hasPressedDown: false, tool: nextToolEphemeral }
            const effect = new ReleaseEffect(brushPoints)
            return [nextState, nextEphemeral, effect]
        }
        case CanvasMsgType.OnDrag: {
            if (!ephemeral.hasPressedDown) {
                return [state, ephemeral, NoOpEffect.value]
            }
            const [nextTool, nextToolEphemeral, brushPoints] = Tools.onDrag(
                state.tool,
                ephemeral.tool,
                pointersToBrushInputs(canvasInfo, state.tool.camera, msg.inputs)
            )
            const nextState = { ...state, tool: nextTool }
            const nextEphemeral = { ...ephemeral, tool: nextToolEphemeral }
            const effect = new BrushPointsEffect(brushPoints)
            return [nextState, nextEphemeral, effect]
        }
        case CanvasMsgType.RandomizeTheme: {
            const [theme, rng] = Theme.random(ephemeral.themeRng)
            const nextState = { ...state, rng, theme }
            return [nextState, ephemeral, NoOpEffect.value]
        }
        case CanvasMsgType.ToolMsg: {
            const nextState = { ...state, tool: Tools.update(state.tool, msg.msg) }
            return [nextState, ephemeral, NoOpEffect.value]
        }
        case CanvasMsgType.LayersMsg: {
            const nextState = { ...state, layers: state.layers.update(msg.msg) }
            return [nextState, ephemeral, NoOpEffect.value]
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
            case EffectType.NoOpEffect:
                return
            case EffectType.FrameEffect: {
                this.perfTracker.start()
                this.context.addBrushPoints(eff.brushPoints)
                this.context.render({
                    blendMode: Tools.getBlendMode(eff.state.tool),
                    nextLayers: eff.state.layers.split(),
                    resolution: this.resolution,
                    brush: { softness: Tools.getSoftness(eff.state.tool) },
                })
                this.perfTracker.end()
                return
            }
            case EffectType.BrushPointsEffect: {
                this.context.addBrushPoints(eff.brushPoints)
                return
            }
            case EffectType.ReleaseEffect: {
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
