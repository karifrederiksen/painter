import * as Layers from "../layers/model"
import * as Tools from "../tools"
import * as Input from "../input"
import * as Rng from "../rng"
import * as Theme from "../theme"
import * as Context from "./context"
import { BrushPoint } from "./brushShader"
import { Case, Vec2, T2, Result, PerfTracker, T3 } from "../util"

export interface Hooks {
    // readonly onCanvasSnapshot: (snapshot: Snapshot) => void
    // readonly onLayerSnapshot: (snapshot: Snapshot, layerId: number) => void
    readonly onStats: (stats: ReadonlyArray<PerfTracker.Sample>) => void
}

export interface State {
    readonly rng: Rng.Seed
    readonly theme: Theme.Theme
    readonly tool: Tools.Tool
    readonly layers: Layers.State
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
    }
}

export function initEphemeral(): EphemeralState {
    return {
        tool: Tools.initEphemeral(),
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
    | Case<MsgType.OnFrame, number>
    | Case<MsgType.OnClick, Input.PointerInput>
    | Case<MsgType.OnRelease, Input.PointerInput>
    | Case<MsgType.OnDrag, Input.PointerInput>
    | Case<MsgType.RandomizeTheme>
    | Case<MsgType.ToolMsg, Tools.ToolMsg>
    | Case<MsgType.LayersMsg, Layers.Msg>

export const enum EffectType {
    NoOp,
    Frame,
    BrushPoints,
    Release,
}

export type Effect =
    | Case<EffectType.NoOp>
    | Case<EffectType.Frame, T2<ReadonlyArray<BrushPoint>, State>>
    | Case<EffectType.BrushPoints, ReadonlyArray<BrushPoint>>
    | Case<EffectType.Release, ReadonlyArray<BrushPoint>>

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
        onFrame: timeMs => sendMessage({ type: MsgType.OnFrame, value: timeMs }),
        onClick: input => sendMessage({ type: MsgType.OnClick, value: input }),
        onRelease: input => sendMessage({ type: MsgType.OnRelease, value: input }),
        onDrag: input => sendMessage({ type: MsgType.OnDrag, value: input }),
        randomizeTheme: () => sendMessage({ type: MsgType.RandomizeTheme, value: undefined }),
        tool: Tools.createSender(msg => sendMessage({ type: MsgType.ToolMsg, value: msg })),
        layer: Layers.createSender(msg => sendMessage({ type: MsgType.LayersMsg, value: msg })),
    }
}

const noOp: Effect = { type: EffectType.NoOp, value: undefined }

export function update(
    state: State,
    ephemeral: EphemeralState,
    msg: CanvasMsg
): T3<State, EphemeralState, Effect> {
    switch (msg.type) {
        case MsgType.OnFrame: {
            const [nextToolEphemeral, brushPoints] = Tools.onFrame(
                state.tool,
                ephemeral.tool,
                msg.value
            )
            const effect: Effect = { type: EffectType.Frame, value: [brushPoints, state] }
            return [state, { tool: nextToolEphemeral }, effect]
        }
        case MsgType.OnClick: {
            const [nextTool, nextToolEphemeral, brushPoints] = Tools.onClick(
                state.tool,
                ephemeral.tool,
                msg.value
            )
            const nextState = { ...state, tool: nextTool }
            const nextEphemeral = { tool: nextToolEphemeral }
            const effect: Effect = { type: EffectType.BrushPoints, value: brushPoints }
            return [nextState, nextEphemeral, effect]
        }
        case MsgType.OnRelease: {
            const [nextTool, nextToolEphemeral, brushPoints] = Tools.onRelease(
                state.tool,
                ephemeral.tool,
                msg.value
            )
            const nextState = { ...state, tool: nextTool }
            const nextEphemeral = { tool: nextToolEphemeral }
            const effect: Effect = { type: EffectType.Release, value: brushPoints }
            return [nextState, nextEphemeral, effect]
        }
        case MsgType.OnDrag: {
            const [nextTool, nextToolEphemeral, brushPoints] = Tools.onDrag(
                state.tool,
                ephemeral.tool,
                msg.value
            )
            const nextState = { ...state, tool: nextTool }
            const nextEphemeral = { tool: nextToolEphemeral }
            const effect: Effect = { type: EffectType.BrushPoints, value: brushPoints }
            return [nextState, nextEphemeral, effect]
        }
        case MsgType.RandomizeTheme: {
            const [theme, rng] = Theme.random(state.rng)
            const nextState = { ...state, rng, theme }
            return [nextState, ephemeral, noOp]
        }
        case MsgType.ToolMsg: {
            const nextState = { ...state, tool: Tools.update(state.tool, msg.value) }
            return [nextState, ephemeral, noOp]
        }
        case MsgType.LayersMsg: {
            const nextState = { ...state, layers: state.layers.update(msg.value) }
            return [nextState, ephemeral, noOp]
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
                this.context.addBrushPoints(eff.value[0])
                const resolution = new Vec2(this.canvasElement.width, this.canvasElement.height)
                const state = eff.value[1]
                this.context.render({
                    blendMode: Tools.getBlendMode(state.tool),
                    nextLayers: this.splitLayers,
                    resolution,
                    brush: { softness: Tools.getSoftness(state.tool) },
                })
                return
            }
            case EffectType.BrushPoints: {
                this.context.addBrushPoints(eff.value)
                return
            }
            case EffectType.Release: {
                this.context.addBrushPoints(eff.value)
                this.context.endStroke()
                return
            }
        }
    }

    dispose(): void {
        this.context.dispose()
    }
}
