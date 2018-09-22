import { Renderer } from "./rendering/renderer"
import { BrushPoint } from "./rendering/brushShader"
import { LayerState, LayersMsg, createLayerSender, LayerMessageSender } from "./layers"
import { RenderStats, Stats } from "./renderStats"
import { PointerInput } from "./input"
import {
    Tool,
    ToolMsg,
    update as toolsUpdate,
    init as toolsInit,
    onClick as toolsOnClick,
    onRelease as toolsOnRelease,
    onDrag as toolsOnDrag,
    onFrame as toolsOnFrame,
} from "./tools"
import { Stroke } from "./rendering/stroke"
import { ToolMessageSender, createToolSender } from "./tools"
import { OutputShader } from "./rendering/outputShader"
import { Texture } from "./rendering/texture"
import { CombinedLayers } from "./rendering/combinedLayers"
import { Rgb } from "canvas/color"
import { Msg, Vec4 } from "canvas/util"

export interface CanvasHooks {
    // readonly onCanvasSnapshot: (snapshot: Snapshot) => void
    // readonly onLayerSnapshot: (snapshot: Snapshot, layerId: number) => void
    readonly onStats: (stats: Stats) => void
}

export interface CanvasState {
    readonly tool: Tool
    readonly layers: LayerState
}

export function defaultState(): CanvasState {
    return {
        tool: toolsInit(),
        layers: LayerState.init(),
    }
}

export const enum CanvasMsgType {
    ToolMsg,
    LayersMsg,
}

export type CanvasMsg =
    | Msg<CanvasMsgType.ToolMsg, ToolMsg>
    | Msg<CanvasMsgType.LayersMsg, LayersMsg>

export function update(state: CanvasState, msg: CanvasMsg): CanvasState {
    switch (msg.type) {
        case CanvasMsgType.ToolMsg:
            return { ...state, tool: toolsUpdate(state.tool, msg.payload) }
        case CanvasMsgType.LayersMsg:
            return { ...state, layers: state.layers.update(msg.payload) }
    }
}

export const enum InternalMsgType {
    BrushPoints,
    EndFrame,
}

export type InternalMsg =
    | Msg<InternalMsgType.BrushPoints, ReadonlyArray<BrushPoint>>
    | Msg<InternalMsgType.EndFrame, CanvasState>

export class Canvas {
    static create(canvas: HTMLCanvasElement, hooks: CanvasHooks): Canvas | null {
        const renderer = Renderer.create(canvas)
        if (renderer === null) return null

        const stroke = Stroke.create(renderer)
        if (stroke === null) return null

        const outputShader = OutputShader.create(renderer)
        if (outputShader === null) return null

        const outputTexture = renderer.createTexture(renderer.getCanvasResolution())

        return new Canvas(canvas, renderer, stroke, hooks, outputTexture, outputShader)
    }

    private readonly renderWrapper: RenderStats
    private readonly combineLayers: CombinedLayers
    private hasRendered: boolean = false

    private constructor(
        readonly canvasElement: HTMLCanvasElement,
        private readonly renderer: Renderer,
        private readonly stroke: Stroke,
        private readonly hooks: CanvasHooks,
        private readonly outputTexture: Texture,
        private readonly outputShader: OutputShader
    ) {
        this.renderWrapper = new RenderStats({
            maxSamples: 200,
            outputFrequency: 100,
            onStats: this.hooks.onStats,
        })
        this.combineLayers = new CombinedLayers(renderer, renderer.getCanvasResolution())
    }

    onClick(tool: Tool, input: PointerInput): Tool {
        const [newTool, brushPoints] = toolsOnClick(tool, input)
        this.stroke.addPoints(brushPoints)
        return newTool
    }

    onRelease(tool: Tool, input: PointerInput): Tool {
        const [newTool, brushPoints] = toolsOnRelease(tool, input)
        this.stroke.addPoints(brushPoints)
        return newTool
    }

    onDrag(tool: Tool, input: PointerInput): Tool {
        const [newTool, brushPoints] = toolsOnDrag(tool, input)
        this.stroke.addPoints(brushPoints)
        return newTool
    }

    onFrame(tool: Tool, currentTime: number): Tool {
        const [newTool, brushPoints] = toolsOnFrame(tool, currentTime)
        this.stroke.addPoints(brushPoints)
        return newTool
    }

    endFrame(state: CanvasState): void {
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

    private endFrame_ = (_state: CanvasState): void => {
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
        renderer.setClearColor(Rgb.White, 1.0)
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
export interface MessageSender {
    readonly tool: ToolMessageSender
    readonly layer: LayerMessageSender
}

export function createSender(sendMessage: (msg: CanvasMsg) => void): MessageSender {
    return {
        tool: createToolSender(msg => sendMessage({ type: CanvasMsgType.ToolMsg, payload: msg })),
        layer: createLayerSender(msg =>
            sendMessage({ type: CanvasMsgType.LayersMsg, payload: msg })
        ),
    }
}
