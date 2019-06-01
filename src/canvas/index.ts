import * as Layers from "../layers/model"
import * as Tools from "../tools"
import * as Input from "../input"
import * as Rng from "../rng"
import * as Theme from "../theme"
import * as Context from "./context"
import { BrushPoint } from "./brushShader"
import { Vec2, Result, PerfTracker, T3 } from "../util"

export interface Hooks {
    // readonly onCanvasSnapshot: (snapshot: Snapshot) => void
    // readonly onLayerSnapshot: (snapshot: Snapshot, layerId: number) => void
    readonly onStats: (stats: ReadonlyArray<PerfTracker.Sample>) => void
    readonly onWebglContextCreated: (gl: WebGLRenderingContext) => void
}

export interface State {
    readonly rng: Rng.Seed
    readonly theme: Theme.Theme
    readonly tool: Tools.Tool
    readonly layers: Layers.State
    readonly hasPressedDown: boolean
}

export interface EphemeralState {
    readonly tool: Tools.EphemeralState
}

export function initState(): State {
    const [theme, rng] = Theme.random(Rng.seed(145264772))

    return {
        rng,
        theme,
        tool: Tools.init(),
        layers: Layers.State.init(),
        hasPressedDown: false,
    }
}

export function initEphemeral(): EphemeralState {
    return {
        tool: Tools.initEphemeral(),
    }
}

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
    constructor(readonly input: Input.PointerInput) {}
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
    constructor(readonly brushPoints: ReadonlyArray<BrushPoint>, readonly state: State) {}
}
class BrushPointsEffect {
    readonly type: EffectType.BrushPointsEffect = EffectType.BrushPointsEffect
    private nominal: void
    constructor(readonly brushPoints: ReadonlyArray<BrushPoint>) {}
}
class ReleaseEffect {
    readonly type: EffectType.ReleaseEffect = EffectType.ReleaseEffect
    private nominal: void
    constructor(readonly brushPoints: ReadonlyArray<BrushPoint>) {}
}

export interface MsgSender {
    readonly onFrame: (timeMs: number) => void
    readonly onClick: (input: Input.PointerInput) => void
    readonly onRelease: (input: Input.PointerInput) => void
    readonly onDrag: (input: Input.PointerInput) => void
    readonly randomizeTheme: () => void
    readonly tool: Tools.MsgSender
    readonly layer: Layers.MsgSender
}

export function createSender(sendMessage: (msg: CanvasMsg) => void): MsgSender {
    return {
        onFrame: timeMs => sendMessage(new OnFrame(timeMs)),
        onClick: input => sendMessage(new OnClick(input)),
        onRelease: input => sendMessage(new OnRelease(input)),
        onDrag: input => sendMessage(new OnDrag(input)),
        randomizeTheme: () => sendMessage(new RandomizeTheme()),
        tool: Tools.createSender(msg => sendMessage(new ToolMsg(msg))),
        layer: Layers.createSender(msg => sendMessage(new LayersMsg(msg))),
    }
}

export function update(
    state: State,
    ephemeral: EphemeralState,
    msg: CanvasMsg
): T3<State, EphemeralState, Effect> {
    switch (msg.type) {
        case CanvasMsgType.OnFrame: {
            const [nextToolEphemeral, brushPoints] = Tools.onFrame(
                state.tool,
                ephemeral.tool,
                msg.ms
            )
            const effect = new FrameEffect(brushPoints, state)
            return [state, { tool: nextToolEphemeral }, effect]
        }
        case CanvasMsgType.OnClick: {
            const [nextTool, nextToolEphemeral, brushPoints] = Tools.onClick(
                state.tool,
                ephemeral.tool,
                msg.input
            )
            const nextState = { ...state, hasPressedDown: true, tool: nextTool }
            const nextEphemeral = { tool: nextToolEphemeral }
            const effect = new BrushPointsEffect(brushPoints)
            return [nextState, nextEphemeral, effect]
        }
        case CanvasMsgType.OnRelease: {
            const [nextTool, nextToolEphemeral, brushPoints] = Tools.onRelease(
                state.tool,
                ephemeral.tool,
                msg.input
            )
            const nextState = { ...state, hasPressedDown: false, tool: nextTool }
            const nextEphemeral = { tool: nextToolEphemeral }
            const effect = new ReleaseEffect(brushPoints)
            return [nextState, nextEphemeral, effect]
        }
        case CanvasMsgType.OnDrag: {
            if (!state.hasPressedDown) {
                return [state, ephemeral, NoOpEffect.value]
            }
            const [nextTool, nextToolEphemeral, brushPoints] = Tools.onDrag(
                state.tool,
                ephemeral.tool,
                msg.input
            )
            const nextState = { ...state, tool: nextTool }
            const nextEphemeral = { tool: nextToolEphemeral }
            const effect = new BrushPointsEffect(brushPoints)
            return [nextState, nextEphemeral, effect]
        }
        case CanvasMsgType.RandomizeTheme: {
            const [theme, rng] = Theme.random(state.rng)
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

export class Canvas {
    static create(canvas: HTMLCanvasElement, initialState: State, hooks: Hooks): Canvas | null {
        const context = Context.create(canvas)
        if (Result.isOk(context)) {
            if (process.env.NODE_ENV === "development") {
                hooks.onWebglContextCreated(context[1][1])
            }
            return new Canvas(canvas, initialState, hooks, context[1][0])
        }
        console.error("Error in Context setup:", context[1])
        return null
    }

    private readonly perfTracker: PerfTracker
    private splitLayers: Layers.SplitLayers

    private constructor(
        readonly canvasElement: HTMLCanvasElement,
        initialState: State,
        private readonly hooks: Hooks,
        private readonly context: Context.Context
    ) {
        this.perfTracker = new PerfTracker({
            maxSamples: 50,
            onSamples: this.hooks.onStats,
        })
        this.splitLayers = initialState.layers.split()
    }

    update(newState: State): void {
        this.splitLayers = newState.layers.split()
    }

    handle(eff: Effect): void {
        switch (eff.type) {
            case EffectType.NoOpEffect:
                return
            case EffectType.FrameEffect: {
                this.perfTracker.start()
                this.context.addBrushPoints(eff.brushPoints)
                const resolution = new Vec2(this.canvasElement.width, this.canvasElement.height)
                const state = eff.state

                this.context.render({
                    blendMode: Tools.getBlendMode(state.tool),
                    nextLayers: this.splitLayers,
                    resolution,
                    brush: { softness: Tools.getSoftness(state.tool) },
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
