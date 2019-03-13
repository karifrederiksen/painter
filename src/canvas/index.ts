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

class OnFrame {
    private nominal: void
    constructor(readonly ms: number) {}
}
class OnClick {
    private nominal: void
    constructor(readonly input: Input.PointerInput) {}
}
class OnRelease {
    private nominal: void
    constructor(readonly input: Input.PointerInput) {}
}
class OnDrag {
    private nominal: void
    constructor(readonly input: Input.PointerInput) {}
}
class RandomizeTheme {
    private nominal: void
    constructor() {}
}
class ToolMsg {
    private nominal: void
    constructor(readonly msg: Tools.ToolMsg) {}
}
class LayersMsg {
    private nominal: void
    constructor(readonly msg: Layers.Msg) {}
}

export type CanvasMsg =
    | OnFrame
    | OnClick
    | OnRelease
    | OnDrag
    | RandomizeTheme
    | ToolMsg
    | LayersMsg

class NoOpEffect {
    readonly nominal: void
    constructor() {}
}

class FrameEffect {
    readonly nominal: void
    constructor(readonly brushPoints: ReadonlyArray<BrushPoint>, readonly state: State) {}
}
class BrushPointsEffect {
    readonly nominal: void
    constructor(readonly brushPoints: ReadonlyArray<BrushPoint>) {}
}
class ReleaseEffect {
    readonly nominal: void
    constructor(readonly brushPoints: ReadonlyArray<BrushPoint>) {}
}

export type Effect =
    | NoOpEffect
    | FrameEffect
    | BrushPointsEffect
    | ReleaseEffect

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

const noOp: Effect = new NoOpEffect()

export function update(
    state: State,
    ephemeral: EphemeralState,
    msg: CanvasMsg
): T3<State, EphemeralState, Effect> {
    if (msg instanceof OnFrame) {
        const [nextToolEphemeral, brushPoints] = Tools.onFrame(
            state.tool,
            ephemeral.tool,
            msg.ms
        )
        const effect = new FrameEffect(brushPoints, state)
        return [state, { tool: nextToolEphemeral }, effect]
    }
    if (msg instanceof OnClick) {
        const [nextTool, nextToolEphemeral, brushPoints] = Tools.onClick(
            state.tool,
            ephemeral.tool,
            msg.input
        )
        const nextState = { ...state, tool: nextTool }
        const nextEphemeral = { tool: nextToolEphemeral }
        const effect = new BrushPointsEffect(brushPoints)
        return [nextState, nextEphemeral, effect]
    }
    if (msg instanceof OnRelease) {
        const [nextTool, nextToolEphemeral, brushPoints] = Tools.onRelease(
            state.tool,
            ephemeral.tool,
            msg.input
        )
        const nextState = { ...state, tool: nextTool }
        const nextEphemeral = { tool: nextToolEphemeral }
        const effect = new ReleaseEffect(brushPoints)
        return [nextState, nextEphemeral, effect]
    }
    if (msg instanceof OnDrag) {
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
    if (msg instanceof RandomizeTheme) {
        const [theme, rng] = Theme.random(state.rng)
        const nextState = { ...state, rng, theme }
        return [nextState, ephemeral, noOp]
    }
    if (msg instanceof ToolMsg) {
        const nextState = { ...state, tool: Tools.update(state.tool, msg.msg) }
        return [nextState, ephemeral, noOp]
    }
    if (msg instanceof LayersMsg) {
        const nextState = { ...state, layers: state.layers.update(msg.msg) }
        return [nextState, ephemeral, noOp]
    }
    const never: never = msg
    throw { "unexpected msg": msg }
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
        if (eff instanceof FrameEffect) {
            this.context.addBrushPoints(eff.brushPoints)
            const resolution = new Vec2(this.canvasElement.width, this.canvasElement.height)
            const state = eff.state
            this.context.render({
                blendMode: Tools.getBlendMode(state.tool),
                nextLayers: this.splitLayers,
                resolution,
                brush: { softness: Tools.getSoftness(state.tool) },
            })
            return
        }
        if (eff instanceof BrushPointsEffect) {
            this.context.addBrushPoints(eff.brushPoints)
            return
        }
        if (eff instanceof ReleaseEffect) {
            this.context.addBrushPoints(eff.brushPoints)
            this.context.endStroke()
            return
        }
        if (eff instanceof NoOpEffect) {
            return
        }
    }

    dispose(): void {
        this.context.dispose()
    }
}
