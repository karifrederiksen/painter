import * as Renderer from "./rendering/renderer"
import * as Layers from "./layers"
import * as Stats from "./renderStats"
import * as Tools from "./tools"
import * as Input from "./input"
import * as Stroke from "./rendering/stroke"
import * as OutputShader from "./rendering/outputShader"
import * as Texture from "./rendering/texture"
import * as CombinedLayers from "./rendering/combinedLayers"
import * as Color from "./color"
import * as Rng from "./rng"
import * as Theme from "./theme"
import { BrushPoint } from "./rendering/brushShader"
import { Action, Vec4, Vec2, T2 } from "./util"

export interface Hooks {
    // readonly onCanvasSnapshot: (snapshot: Snapshot) => void
    // readonly onLayerSnapshot: (snapshot: Snapshot, layerId: number) => void
    readonly onStats: (stats: Stats.Stats) => void
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
    | Action<EffectType.Frame, ReadonlyArray<BrushPoint>>
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
            const effect: Effect = { type: EffectType.Frame, payload: brushPoints }
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
    static create(canvas: HTMLCanvasElement, hooks: Hooks): Canvas | null {
        const renderer = Renderer.Renderer.create(canvas)
        const resolution = getResolution(canvas)
        if (renderer === null) return null

        const stroke = Stroke.Stroke.create(renderer, resolution)
        if (stroke === null) return null

        const outputShader = OutputShader.Shader.create(renderer)
        if (outputShader === null) return null

        const outputTexture = renderer.createTexture(resolution)

        return new Canvas(canvas, renderer, stroke, hooks, outputTexture, outputShader)
    }

    private readonly combineLayers: CombinedLayers.CombinedLayers

    private constructor(
        readonly canvasElement: HTMLCanvasElement,
        private readonly renderer: Renderer.Renderer,
        private readonly stroke: Stroke.Stroke,
        private readonly hooks: Hooks,
        private readonly outputTexture: Texture.Texture,
        private readonly outputShader: OutputShader.Shader
    ) {
        this.combineLayers = new CombinedLayers.CombinedLayers(
            renderer,
            getResolution(this.canvasElement)
        )
    }

    update(newState: State): void {
        this.combineLayers.update({
            flattened: newState.layers.split(),
            renderer: this.renderer,
            size: getResolution(this.canvasElement),
        })
    }

    handle(eff: Effect): void {
        switch (eff.type) {
            case EffectType.NoOp:
                return
            case EffectType.Frame:
                this.stroke.addPoints(eff.payload)
                this.render()
                return
            case EffectType.BrushPoints:
                this.stroke.addPoints(eff.payload)
                return
            case EffectType.Release:
                this.stroke.addPoints(eff.payload)
                this.endStroke()
                return
        }
    }

    private endStroke(): void {
        const { stroke, combineLayers, renderer } = this
        const resolution = getResolution(this.canvasElement)

        if (stroke.shader.canFlush) {
            stroke.render(renderer, resolution)
        }

        if (combineLayers.current !== null) {
            // render the stroke to the current layer
            combineLayers.applyStrokeToUnderlying(renderer, resolution, stroke)
            // TODO: store the stroke in history
        } else {
            console.info("released with no layer selected")
        }
        stroke.clear(renderer)
    }

    private render(): void {
        const { renderer, stroke, outputTexture, outputShader, combineLayers } = this
        const resolution = getResolution(this.canvasElement)
        if (stroke.shader.canFlush) {
            stroke.render(renderer, resolution)
        }
        combineLayers.applyStroke(renderer, resolution, stroke)

        // render to outputTexture
        outputTexture.updateSize(renderer, resolution)
        renderer.setViewport(new Vec4(0, 0, resolution.x, resolution.y))
        renderer.setClearColor(Color.RgbLinear.Black.mix(0.3, Color.RgbLinear.White), 1.0)
        renderer.clear(outputTexture.framebuffer)

        // BELOW
        renderer.shaders.textureShader.render(renderer, {
            opacity: 1,
            resolution,
            framebuffer: outputTexture.framebuffer,
            texture: combineLayers.below,
            x0: 0,
            y0: 0,
            x1: resolution.x,
            y1: resolution.y,
        })
        // CURRENT
        renderer.shaders.textureShader.render(renderer, {
            opacity: combineLayers.currentOpacity,
            resolution,
            framebuffer: outputTexture.framebuffer,
            texture: combineLayers.current,
            x0: 0,
            y0: 0,
            x1: resolution.x,
            y1: resolution.y,
        })
        // ABOVE
        renderer.shaders.textureShader.render(renderer, {
            opacity: 1,
            resolution,
            framebuffer: outputTexture.framebuffer,
            texture: combineLayers.above,
            x0: 0,
            y0: 0,
            x1: resolution.x,
            y1: resolution.y,
        })

        // outputTexture -> canvas
        outputShader.render(renderer, {
            resolution,
            texture: outputTexture,
            x0: 0,
            y0: 0,
            x1: resolution.x,
            y1: resolution.y,
        })
        renderer.gl.flush()
        //renderer.gl.finish()
    }

    dispose(): void {
        this.outputShader.dispose(this.renderer.gl)
        this.renderer.dispose()
    }
}

function getResolution({ width, height }: HTMLCanvasElement) {
    return new Vec2(width, height)
}
