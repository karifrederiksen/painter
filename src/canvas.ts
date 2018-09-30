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
import { Action, Vec4, Vec2 } from "./util"

export interface Hooks {
    // readonly onCanvasSnapshot: (snapshot: Snapshot) => void
    // readonly onLayerSnapshot: (snapshot: Snapshot, layerId: number) => void
    readonly onStats: (stats: Stats.Stats) => void
}

export interface State {
    readonly rng: Rng.State
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
}

export type CanvasMsg =
    | Action<MsgType.RandomizeTheme>
    | Action<MsgType.ToolMsg, Tools.ToolMsg>
    | Action<MsgType.LayersMsg, Layers.Msg>

export interface MsgSender {
    randomizeTheme(): void
    readonly tool: Tools.MsgSender
    readonly layer: Layers.MsgSender
}

export function createSender(sendMessage: (msg: CanvasMsg) => void): MsgSender {
    return {
        randomizeTheme: () => sendMessage({ type: MsgType.RandomizeTheme, payload: undefined }),
        tool: Tools.createSender(msg => sendMessage({ type: MsgType.ToolMsg, payload: msg })),
        layer: Layers.createSender(msg => sendMessage({ type: MsgType.LayersMsg, payload: msg })),
    }
}

export function update(state: State, msg: CanvasMsg): State {
    switch (msg.type) {
        case MsgType.RandomizeTheme: {
            const [theme, rng] = Theme.random(state.rng)
            return { ...state, rng, theme }
        }
        case MsgType.ToolMsg:
            return { ...state, tool: Tools.update(state.tool, msg.payload) }
        case MsgType.LayersMsg:
            return { ...state, layers: state.layers.update(msg.payload) }
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
    private hasRendered: boolean = false

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

    onUpdate(newState: State): void {
        this.combineLayers.update({
            flattened: newState.layers.split(),
            renderer: this.renderer,
            size: getResolution(this.canvasElement),
        })
    }

    onClick(tool: Tools.Tool, input: Input.PointerInput): Tools.Tool {
        const [newTool, brushPoints] = Tools.onClick(tool, input)
        this.stroke.addPoints(brushPoints)
        return newTool
    }

    onRelease(tool: Tools.Tool, input: Input.PointerInput): Tools.Tool {
        const { stroke, combineLayers, renderer } = this
        const [newTool, brushPoints] = Tools.onRelease(tool, input)
        const resolution = getResolution(this.canvasElement)

        stroke.addPoints(brushPoints)
        if (stroke.shader.canFlush) {
            stroke.render(renderer, resolution)
        }

        if (combineLayers.current !== null) {
            // render the stroke to the current layer
            renderer.setViewport(new Vec4(0, 0, resolution.x, resolution.y))
            renderer.setFramebuffer(combineLayers.current.framebuffer)
            renderer.shaders.textureShader.render(renderer, {
                resolution,
                texture: stroke.texture,
                x0: 0,
                y0: 0,
                x1: resolution.x,
                y1: resolution.y,
            })
            // TODO: store the stroke in history
        } else {
            console.info("released with no layer selected")
        }
        stroke.clear(renderer)
        return newTool
    }

    onDrag(tool: Tools.Tool, input: Input.PointerInput): Tools.Tool {
        const [newTool, brushPoints] = Tools.onDrag(tool, input)
        this.stroke.addPoints(brushPoints)
        return newTool
    }

    onFrame(tool: Tools.Tool, currentTime: number): Tools.Tool {
        const [newTool, brushPoints] = Tools.onFrame(tool, currentTime)
        this.stroke.addPoints(brushPoints)
        return newTool
    }

    endFrame(state: State): void {
        const { renderer, stroke, outputTexture, outputShader, combineLayers } = this
        const resolution = getResolution(this.canvasElement)
        if (stroke.shader.canFlush) {
            stroke.render(renderer, resolution)
        }

        // render to outputTexture
        outputTexture.updateSize(renderer, resolution)
        renderer.setFramebuffer(outputTexture.framebuffer)
        renderer.setViewport(new Vec4(0, 0, resolution.x, resolution.y))
        renderer.setClearColor(Color.RgbLinear.Black.mix(0.3, Color.RgbLinear.White), 1.0)
        renderer.clear()
        {
            // BELOW
            renderer.setFramebuffer(outputTexture.framebuffer)
            renderer.shaders.textureShader.render(renderer, {
                resolution,
                texture: combineLayers.below,
                x0: 0,
                y0: 0,
                x1: resolution.x,
                y1: resolution.y,
            })
        }

        if (combineLayers.current !== null) {
            // CURRENT
            renderer.setFramebuffer(outputTexture.framebuffer)
            renderer.shaders.textureShader.render(renderer, {
                resolution,
                texture: combineLayers.current,
                x0: 0,
                y0: 0,
                x1: resolution.x,
                y1: resolution.y,
            })

            // STROKE
            renderer.setFramebuffer(outputTexture.framebuffer)
            renderer.shaders.textureShader.render(renderer, {
                resolution,
                texture: stroke.texture,
                x0: 0,
                y0: 0,
                x1: resolution.x,
                y1: resolution.y,
            })
        }
        {
            // ABOVE
            renderer.setFramebuffer(outputTexture.framebuffer)
            renderer.shaders.textureShader.render(renderer, {
                resolution,
                texture: combineLayers.above,
                x0: 0,
                y0: 0,
                x1: resolution.x,
                y1: resolution.y,
            })
        }

        // outputTexture -> canvas
        renderer.setFramebuffer(null)
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
