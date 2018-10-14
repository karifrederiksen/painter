import * as Layers from "./layers"
import * as Stats from "./renderStats"
import * as Tools from "./tools"
import * as Input from "./input"
import * as Rng from "./rng"
import * as Theme from "./theme"
import * as Context from "./rendering/context"
import { BrushPoint } from "./rendering/brushShader"
import { Action, Vec2, T2, Result } from "./util"
import { Blend } from "./web-gl"

export interface Hooks {
    // readonly onCanvasSnapshot: (snapshot: Snapshot) => void
    // readonly onLayerSnapshot: (snapshot: Snapshot, layerId: number) => void
    readonly onStats: (stats: ReadonlyArray<Stats.Sample>) => void
}

export interface State {
    readonly rng: Rng.Seed
    readonly theme: Theme.Theme
    readonly tool: Tools.Tool
    readonly layers: Layers.State
}

export function initState(): State {
    const [theme, rng] = Theme.random(Rng.seed(145264772))

    return {
        rng,
        theme,
        tool: Tools.init(),
        layers: Layers.State.init(),
    }
}

export const enum MsgType {
    RandomizeTheme,
    ToolMsg,
    LayersMsg,
    OnClick,
    OnRelease,
    OnDrag,
    OnFrame,
}

export type CanvasMsg =
    | Action<MsgType.OnFrame, number>
    | Action<MsgType.OnClick, Input.PointerInput>
    | Action<MsgType.OnRelease, Input.PointerInput>
    | Action<MsgType.OnDrag, Input.PointerInput>
    | Action<MsgType.RandomizeTheme>
    | Action<MsgType.ToolMsg, Tools.ToolMsg>
    | Action<MsgType.LayersMsg, Layers.Msg>

export const enum EffectType {
    NoOp,
    Frame,
    BrushPoints,
    Release,
}

export type Effect =
    | Action<EffectType.NoOp>
    | Action<EffectType.Frame, T2<ReadonlyArray<BrushPoint>, State>>
    | Action<EffectType.BrushPoints, ReadonlyArray<BrushPoint>>
    | Action<EffectType.Release, ReadonlyArray<BrushPoint>>

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
        onFrame: timeMs => sendMessage({ type: MsgType.OnFrame, payload: timeMs }),
        onClick: input => sendMessage({ type: MsgType.OnClick, payload: input }),
        onRelease: input => sendMessage({ type: MsgType.OnRelease, payload: input }),
        onDrag: input => sendMessage({ type: MsgType.OnDrag, payload: input }),
        randomizeTheme: () => sendMessage({ type: MsgType.RandomizeTheme, payload: undefined }),
        tool: Tools.createSender(msg => sendMessage({ type: MsgType.ToolMsg, payload: msg })),
        layer: Layers.createSender(msg => sendMessage({ type: MsgType.LayersMsg, payload: msg })),
    }
}

const noOp: Effect = { type: EffectType.NoOp, payload: undefined }

export function update(state: State, msg: CanvasMsg): T2<State, Effect> {
    switch (msg.type) {
        case MsgType.OnFrame: {
            const [newTool, brushPoints] = Tools.onFrame(state.tool, msg.payload)
            const nextState = { ...state, tool: newTool }
            const effect: Effect = { type: EffectType.Frame, payload: [brushPoints, state] }
            return [nextState, effect]
        }
        case MsgType.OnClick: {
            const [newTool, brushPoints] = Tools.onClick(state.tool, msg.payload)
            const nextState = { ...state, tool: newTool }
            const effect: Effect = { type: EffectType.BrushPoints, payload: brushPoints }
            return [nextState, effect]
        }
        case MsgType.OnRelease: {
            const [newTool, brushPoints] = Tools.onRelease(state.tool, msg.payload)
            const nextState = { ...state, tool: newTool }
            const effect: Effect = { type: EffectType.Release, payload: brushPoints }
            return [nextState, effect]
        }
        case MsgType.OnDrag: {
            const [newTool, brushPoints] = Tools.onDrag(state.tool, msg.payload)
            const nextState = { ...state, tool: newTool }
            const effect: Effect = { type: EffectType.BrushPoints, payload: brushPoints }
            return [nextState, effect]
        }
        case MsgType.RandomizeTheme: {
            const [theme, rng] = Theme.random(state.rng)
            const nextState = { ...state, rng, theme }
            return [nextState, noOp]
        }
        case MsgType.ToolMsg: {
            const nextState = { ...state, tool: Tools.update(state.tool, msg.payload) }
            return [nextState, noOp]
        }
        case MsgType.LayersMsg: {
            const nextState = { ...state, layers: state.layers.update(msg.payload) }
            return [nextState, noOp]
        }
    }
}

export class Canvas {
    static create(canvas: HTMLCanvasElement, initialState: State, hooks: Hooks): Canvas | null {
        const context = Context.create(canvas)
        if (Result.isOk(context)) {
            return new Canvas(canvas, initialState, hooks, context[1])
        }
        console.error("Error in Context setup:", context[1])
        return null
    }

    private splitLayers: Layers.SplitLayers

    private constructor(
        readonly canvasElement: HTMLCanvasElement,
        initialState: State,
        private readonly hooks: Hooks,
        private readonly context: Context.Context
    ) {
        this.splitLayers = initialState.layers.split()
    }

    update(newState: State): void {
        this.splitLayers = newState.layers.split()
    }

    handle(eff: Effect): void {
        switch (eff.type) {
            case EffectType.NoOp:
                return
            case EffectType.Frame: {
                this.context.addBrushPoints(eff.payload[0])
                const resolution = new Vec2(this.canvasElement.width, this.canvasElement.height)
                const state = eff.payload[1]
                this.context.render({
                    blendMode: Tools.getBlendMode(state.tool.current),
                    nextLayers: this.splitLayers,
                    resolution,
                    brush: { softness: Tools.getSoftness(state.tool) },
                })
                return
            }
            case EffectType.BrushPoints: {
                this.context.addBrushPoints(eff.payload)
                return
            }
            case EffectType.Release: {
                this.context.addBrushPoints(eff.payload)
                this.context.endStroke()
                return
            }
        }
    }

    dispose(): void {
        this.context.dispose()
    }
}
