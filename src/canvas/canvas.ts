import { Renderer } from "./rendering/renderer"
import { Rgb, Vec2, Vec4, Msg } from "../data"
import { BrushPoint } from "./rendering/brushShader"
import { Layers, LayersMsg } from "./layers"
import { RenderStats, Stats } from "./renderStats"
import { PointerInput } from "./input/inputListener"
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
import { TextureShader } from "./rendering/textureShader"

export interface CanvasHooks {
    // readonly onCanvasSnapshot: (snapshot: Snapshot) => void
    // readonly onLayerSnapshot: (snapshot: Snapshot, layerId: number) => void
    readonly onStats: (stats: Stats) => void
}

export interface CanvasState {
    readonly tool: Tool
    readonly layers: Layers
}

export function defaultState(): CanvasState {
    return {
        tool: toolsInit(),
        layers: Layers.init(),
    }
}

export const enum CanvasMsgType {
    ToolMsg,
    LayersMsg,
}

export type CanvasMsg =
    | Msg<CanvasMsgType.ToolMsg, ToolMsg>
    | Msg<CanvasMsgType.LayersMsg, LayersMsg>

export function toolMessage(msg: ToolMsg): CanvasMsg {
    return { type: CanvasMsgType.ToolMsg, payload: msg }
}

export function layersMessage(msg: LayersMsg): CanvasMsg {
    return { type: CanvasMsgType.LayersMsg, payload: msg }
}

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

        const texShader = TextureShader.create(renderer)
        if (texShader === null) return null

        return new Canvas(canvas, renderer, stroke, texShader, hooks)
    }

    private readonly renderWrapper: RenderStats

    private constructor(
        readonly canvasElement: HTMLCanvasElement,
        private readonly renderer: Renderer,
        private readonly stroke: Stroke,
        private readonly textureShader: TextureShader,
        private readonly hooks: CanvasHooks
    ) {
        this.renderWrapper = new RenderStats({
            maxSamples: 200,
            outputFrequency: 100,
            onStats: this.hooks.onStats,
        })
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
        this.renderWrapper.timedRender(state, this.endFrame_)
    }

    private endFrame_ = (_state: CanvasState): void => {
        const { renderer, stroke, textureShader } = this
        if (stroke.shader.canFlush) {
            stroke.render(renderer)
        }

        const resolution = renderer.getCanvasResolution()
        renderer.setFramebuffer(null)
        renderer.setViewport(new Vec4(0, 0, resolution.x, resolution.y))
        renderer.setClearColor(Rgb.White, 1.0)
        renderer.clear()

        const textureIndex = renderer.bindTexture(stroke.texture)
        textureShader.render(renderer, {
            resolution,
            textureIndex,
            x0: 0,
            y0: 0,
            x1: resolution.x,
            y1: resolution.y,
        })
    }

    dispose(): void {
        this.renderer.dispose()
    }
}
