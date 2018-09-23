import * as Renderer from "./rendering/renderer"
import * as Layers from "./layers"
import * as Stats from "./renderStats"
import * as Tools from "./tools"
import * as Input from "./input"
import * as Stroke from "./rendering/stroke"
import * as OutputShader from "./rendering/outputShader"
import * as Texture from "./rendering/texture"
import * as CombinedLayers from "./rendering/combinedLayers"
import * as Color from "canvas/color"
import { Action, Vec4 } from "canvas/util"

export interface Hooks {
    // readonly onCanvasSnapshot: (snapshot: Snapshot) => void
    // readonly onLayerSnapshot: (snapshot: Snapshot, layerId: number) => void
    readonly onStats: (stats: Stats.Stats) => void
}

export interface State {
    readonly tool: Tools.Tool
    readonly layers: Layers.State
}

export function initState(): State {
    return {
        tool: Tools.init(),
        layers: Layers.State.init(),
    }
}

export const enum MsgType {
    ToolMsg,
    LayersMsg,
}

export type CanvasMsg =
    | Action<MsgType.ToolMsg, Tools.ToolMsg>
    | Action<MsgType.LayersMsg, Layers.Msg>

export function update(state: State, msg: CanvasMsg): State {
    switch (msg.type) {
        case MsgType.ToolMsg:
            return { ...state, tool: Tools.update(state.tool, msg.payload) }
        case MsgType.LayersMsg:
            return { ...state, layers: state.layers.update(msg.payload) }
    }
}

export class Canvas {
    static create(canvas: HTMLCanvasElement, hooks: Hooks): Canvas | null {
        const renderer = Renderer.Renderer.create(canvas)
        if (renderer === null) return null

        const stroke = Stroke.Stroke.create(renderer)
        if (stroke === null) return null

        const outputShader = OutputShader.Shader.create(renderer)
        if (outputShader === null) return null

        const outputTexture = renderer.createTexture(renderer.getCanvasResolution())

        return new Canvas(canvas, renderer, stroke, hooks, outputTexture, outputShader)
    }

    private readonly renderWrapper: Stats.StatsCapture
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
        this.renderWrapper = new Stats.StatsCapture({
            maxSamples: 200,
            outputFrequency: 100,
            onStats: this.hooks.onStats,
        })
        this.combineLayers = new CombinedLayers.CombinedLayers(
            renderer,
            renderer.getCanvasResolution()
        )
    }

    onClick(tool: Tools.Tool, input: Input.PointerInput): Tools.Tool {
        const [newTool, brushPoints] = Tools.onClick(tool, input)
        this.stroke.addPoints(brushPoints)
        return newTool
    }

    onRelease(tool: Tools.Tool, input: Input.PointerInput): Tools.Tool {
        const [newTool, brushPoints] = Tools.onRelease(tool, input)
        this.stroke.addPoints(brushPoints)
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
        if (!this.needsRender()) return

        this.renderWrapper.timedRender(state, this.endFrame_)
    }

    private needsRender(): boolean {
        if (!this.hasRendered) {
            this.hasRendered = true
            return true
        }
        return this.stroke.shader.canFlush
    }

    private endFrame_ = (_state: State): void => {
        const { renderer, stroke, outputTexture, outputShader, combineLayers } = this
        if (stroke.shader.canFlush) {
            stroke.render(renderer)
        }

        // render to outputTexture
        const resolution = renderer.getCanvasResolution()
        const outputTextureIdx = renderer.bindTexture(outputTexture)

        outputTexture.updateSize(renderer, resolution, outputTextureIdx)
        renderer.setFramebuffer(this.outputTexture.framebuffer)
        renderer.setViewport(new Vec4(0, 0, resolution.x, resolution.y))
        renderer.setClearColor(Color.Rgb.White, 1.0)
        renderer.clear()

        const textureIndex = renderer.bindTexture(stroke.texture)
        renderer.shaders.textureShader.render(renderer, {
            resolution,
            textureIndex,
            x0: 0,
            y0: 0,
            x1: resolution.x,
            y1: resolution.y,
        })

        // outputTexture -> canvas
        renderer.setFramebuffer(null)
        outputShader.render(renderer, {
            resolution,
            textureIndex: outputTextureIdx,
            x0: 0,
            y0: 0,
            x1: resolution.x,
            y1: resolution.y,
        })
    }

    dispose(): void {
        this.outputShader.dispose(this.renderer.gl)
        this.renderer.dispose()
    }
}
export interface MsgSender {
    readonly tool: Tools.MsgSender
    readonly layer: Layers.MsgSender
}

export function createSender(sendMessage: (msg: CanvasMsg) => void): MsgSender {
    return {
        tool: Tools.createSender(msg => sendMessage({ type: MsgType.ToolMsg, payload: msg })),
        layer: Layers.createSender(msg => sendMessage({ type: MsgType.LayersMsg, payload: msg })),
    }
}
