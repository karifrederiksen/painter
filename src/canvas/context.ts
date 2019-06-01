import * as OutputShader from "./outputShader"
import * as BrushTextureShader from "./brushTextureGenerator"
import * as TextureShader from "./textureShader"
import * as ClearBlocksShader from "./clearBlocksShader"
import * as BrushShader from "./brushShader"
import * as Layers from "../layers/model"
import { Blend } from "../webgl"
import { T2, Vec4, Result, Vec2, Brand } from "../util"
import { RgbLinear } from "color"

export interface CreationArgs {
    readonly gl: WebGLRenderingContext
    readonly brushTextureGenerator: BrushTextureShader.Generator
    readonly textureRenderer: TextureShader.Shader
    readonly clearBlocksRenderer: ClearBlocksShader.Shader
    readonly outputRenderer: OutputShader.Shader
    readonly drawpointBatch: BrushShader.Shader
    readonly internalCanvasSize: Vec2
}

export interface RenderArgs {
    readonly resolution: Vec2
    readonly blendMode: Blend.Mode
    readonly brush: {
        readonly softness: number
    }
    readonly nextLayers: Layers.SplitLayers
}

export interface Context {
    addBrushPoints(brushPoints: ReadonlyArray<BrushShader.BrushPoint>): void
    endStroke(): void
    render(args: RenderArgs): void
    dispose(): void
}

export function create(
    canvas: HTMLCanvasElement
): Result<[Context, WebGLRenderingContext], string> {
    const wglArgs: WebGLContextAttributes = {
        antialias: false,
        depth: false,
        alpha: true,
        premultipliedAlpha: false,
        stencil: false,
    }
    const gl = canvas.getContext("webgl", wglArgs)
    if (gl === null) {
        console.error("Failed to initialize WebGL renderer for canvas: ", canvas)
        return Result.err("Failed to initialize WebGL")
    }

    const floatLinearFiltering = gl.getExtension("OES_texture_float_linear")
    if (floatLinearFiltering === null) {
        console.warn(`Couldn't enable "OES_texture_float_linear"`)
    }

    const floatTexture = gl.getExtension("OES_texture_float")
    if (floatTexture === null) {
        console.warn(`Couldn't enable "OES_texture_float"`)
    }

    // TODO: check for half-float
    // TODO: check for max textures

    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.enable(WebGLRenderingContext.BLEND)
    gl.disable(WebGLRenderingContext.DEPTH_TEST)

    const { sfact, dfact } = Blend.factorsNormal
    gl.blendFunc(sfact, dfact)

    const drawpointBatch = BrushShader.Shader.create(gl)
    if (drawpointBatch === null) {
        const msg = "Failed to initialize BrushShader"
        console.error(msg)
        return Result.err(msg)
    }

    const brushTextureGenerator = BrushTextureShader.Generator.create(gl)
    if (brushTextureGenerator === null) {
        const msg = "Failed to initialize BrushTextureGenerator"
        console.error(msg)
        return Result.err(msg)
    }

    const textureRenderer = TextureShader.Shader.create(gl)
    if (textureRenderer === null) {
        const msg = "Failed to initialize TextureShader"
        console.error(msg)
        return Result.err(msg)
    }

    const clearBlocksRenderer = ClearBlocksShader.Shader.create(gl)
    if (clearBlocksRenderer === null) {
        const msg = "Failed to initialize ClearBlocksShader"
        console.error(msg)
        return Result.err(msg)
    }

    const outputRenderer = OutputShader.Shader.create(gl)
    if (outputRenderer === null) {
        const msg = "Failed to initialize OutputShader"
        console.error(msg)
        return Result.err(msg)
    }

    gl.viewport(0, 0, canvas.width, canvas.height)

    const context = new InternalContext({
        gl,
        brushTextureGenerator,
        drawpointBatch,
        outputRenderer,
        textureRenderer,
        clearBlocksRenderer,
        internalCanvasSize: new Vec2(canvas.width, canvas.height),
    })
    return Result.ok<[Context, WebGLRenderingContext], string>([context, gl])
}

type TextureId = Brand<"Texture Id", number>

class Stroke {
    private nominal: void
    constructor(readonly textureId: TextureId, readonly affectedArea: Vec4) {}
}

const createTexture = (() => {
    let nextId = 1

    function createTexture(context: InternalContext, size: Vec2): TextureId {
        const texture = context.gl.createTexture()!
        const id = (nextId++ as any) as TextureId

        console.info("created texture with id", id)

        context.textureMap.set(id, texture)
        setTextureSize(context, id, size)

        return id
    }

    return createTexture
})()

class InternalContext implements Context {
    readonly gl: WebGLRenderingContext
    readonly brushTextureGenerator: BrushTextureShader.Generator
    readonly textureRenderer: TextureShader.Shader
    readonly clearBlocksRenderer: ClearBlocksShader.Shader
    readonly outputRenderer: OutputShader.Shader
    readonly drawpointBatch: BrushShader.Shader
    readonly textureMap: Map<TextureId, WebGLTexture>
    readonly framebufferMap: Map<TextureId, WebGLFramebuffer>
    readonly textureBindings: T2<TextureId | null, number>[]
    readonly layerTextureMap: Map<Layers.Id, TextureId>
    internalCanvasSize: Vec2
    stroke: Stroke | null
    renderBlocks: RenderBlocks
    prevLayers: Layers.SplitLayers
    readonly brushTextureId: TextureId
    readonly currentLayerTextureId: TextureId
    readonly outputTextureId: TextureId
    readonly combinedLayers: {
        readonly above: TextureId
        readonly below: TextureId
        readonly current: TextureId
    }

    constructor(args: CreationArgs) {
        this.gl = args.gl
        this.brushTextureGenerator = args.brushTextureGenerator
        this.textureRenderer = args.textureRenderer
        this.clearBlocksRenderer = args.clearBlocksRenderer
        this.outputRenderer = args.outputRenderer
        this.drawpointBatch = args.drawpointBatch
        this.textureMap = new Map()
        this.framebufferMap = new Map()
        this.textureBindings = new Array(32).fill([null, 0])
        this.layerTextureMap = new Map()
        this.internalCanvasSize = args.internalCanvasSize
        this.stroke = null
        this.renderBlocks = RenderBlocks.EMPTY
        this.prevLayers = {
            above: [],
            below: [],
            current: null,
        }
        {
            const size = new Vec2(128, 128)
            this.brushTextureId = createTexture(this, size)
            this.brushTextureGenerator.generateBrushTexture(this.gl, {
                softness: 0,
                framebuffer: addFramebuffer(this, this.brushTextureId),
                size: size,
            })
        }
        this.currentLayerTextureId = createTexture(this, args.internalCanvasSize)
        this.outputTextureId = createTexture(this, args.internalCanvasSize)
        addFramebuffer(this, this.outputTextureId)
        this.combinedLayers = {
            above: createTexture(this, args.internalCanvasSize),
            below: createTexture(this, args.internalCanvasSize),
            current: createTexture(this, args.internalCanvasSize),
        }
        addFramebuffer(this, this.combinedLayers.above)
        addFramebuffer(this, this.combinedLayers.below)
        addFramebuffer(this, this.combinedLayers.current)

        const outId = this.outputTextureId
        const outFramebuffer = this.framebufferMap.get(outId)!
        this.gl.bindFramebuffer(WebGLRenderingContext.FRAMEBUFFER, outFramebuffer)
        this.gl.clearColor(0.6, 0.6, 0.6, 1)
        this.gl.clear(WebGLRenderingContext.COLOR_BUFFER_BIT)
    }

    addBrushPoints(brushPoints: ReadonlyArray<BrushShader.BrushPoint>) {
        addBrushPoints(this, brushPoints)
    }

    endStroke() {
        endStroke(this)
    }

    render(args: RenderArgs) {
        render(this, args)
    }

    dispose() {
        const { gl } = this
        this.brushTextureGenerator.dispose(gl)
        this.textureRenderer.dispose(gl)
        this.outputRenderer.dispose(gl)
        this.drawpointBatch.dispose(gl)
        for (const x of this.framebufferMap) {
            gl.deleteFramebuffer(x[1])
        }
        for (const x of this.textureMap) {
            gl.deleteTexture(x[1])
        }
    }
}

function mergeAreas(prevArea: Vec4, nextArea: Vec4): Vec4 {
    // Ternary operator is probably better performance
    return new Vec4(
        Math.min(prevArea.x, nextArea.x),
        Math.min(prevArea.y, nextArea.y),
        Math.max(prevArea.z, nextArea.z),
        Math.max(prevArea.w, nextArea.w)
    )
}

function addBrushPoints(
    context: InternalContext,
    brushPoints: ReadonlyArray<BrushShader.BrushPoint>
): void {
    context.drawpointBatch.addPoints(brushPoints)
    context.renderBlocks = context.renderBlocks.withFrame(brushPoints)
    if (!context.drawpointBatch.canFlush) return

    if (context.stroke == null) {
        context.stroke = new Stroke(
            createTexture(context, context.internalCanvasSize),
            context.drawpointBatch.getAffectedArea()
        )
        addFramebuffer(context, context.stroke.textureId)
    } else {
        const affectedArea = mergeAreas(
            context.stroke.affectedArea,
            context.drawpointBatch.getAffectedArea()
        )
        context.stroke = new Stroke(context.stroke.textureId, affectedArea)
    }
}

function endStroke(context: InternalContext): void {
    const { gl, stroke, prevLayers, internalCanvasSize } = context
    if (stroke === null) return
    if (prevLayers.current === null) return

    gl.viewport(0, 0, context.internalCanvasSize.x, context.internalCanvasSize.y)
    context.textureRenderer.render(gl, {
        opacity: 1,
        framebuffer: context.framebufferMap.get(context.combinedLayers.current)!,
        resolution: internalCanvasSize,
        textureIdx: ensureTextureIsBound(context, stroke.textureId),
        blocks: context.renderBlocks.strokeBlocks,
    })

    const strokeFb = context.framebufferMap.get(stroke.textureId)
    if (strokeFb == null) {
        throw "Stroke framebuffer not found"
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, strokeFb)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    context.renderBlocks = RenderBlocks.EMPTY
}

function render(
    context: InternalContext,
    { blendMode, nextLayers, resolution, brush }: RenderArgs
): void {
    if (context.renderBlocks.frameBlocks.length === 0) {
        return
    }

    if (context.drawpointBatch.canFlush) {
        if (nextLayers.current === null) {
            console.warn("Drawpoint batch has data to flush, but no layer is currently selected")
        } else {
            const { gl } = context
            const currentLayerTex = getTextureIdForLayer(context, nextLayers.current.id)!

            const { brushTextureId } = context

            context.brushTextureGenerator.generateBrushTexture(gl, {
                softness: brush.softness,
                framebuffer: context.framebufferMap.get(brushTextureId)!,
                size: new Vec2(128, 128),
            })
            gl.viewport(0, 0, resolution.x, resolution.y)
            gl.bindFramebuffer(gl.FRAMEBUFFER, context.framebufferMap.get(currentLayerTex)!)
            context.drawpointBatch.flush(gl, {
                blendMode,
                resolution,
                brushTextureIdx: ensureTextureIsBound(context, brushTextureId),
            })
        }
    }

    const {
        gl,
        combinedLayers,
        textureRenderer,
        clearBlocksRenderer,
        outputRenderer,
        internalCanvasSize,
        prevLayers,
    } = context

    {
        // ABOVE
        const prev = prevLayers.above
        const next = nextLayers.above
        if (layersRequireRerender(prev, next)) {
            const fb = setupFb(context, combinedLayers.above)
            for (let i = 0; i < next.length; i++) {
                const layer = next[i]
                if (layer.opacity === 0) continue

                const textureId = getTextureIdForLayer(context, layer.id)

                if (textureId == null) {
                    throw "texture id should not be null or undefined"
                }

                textureRenderer.render(gl, {
                    framebuffer: fb,
                    opacity: layer.opacity,
                    resolution: internalCanvasSize,
                    textureIdx: ensureTextureIsBound(context, textureId),
                    blocks: [
                        {
                            x0: 0,
                            y0: 0,
                            x1: internalCanvasSize.x,
                            y1: internalCanvasSize.y,
                        },
                    ],
                })
            }
        }
    }
    {
        // BELOW
        const prev = prevLayers.below
        const next = nextLayers.below
        if (layersRequireRerender(prev, next)) {
            const fb = setupFb(context, combinedLayers.below)
            for (let i = next.length - 1; i >= 0; i--) {
                const layer = next[i]
                if (layer.opacity === 0) continue

                const textureId = getTextureIdForLayer(context, layer.id)!

                textureRenderer.render(gl, {
                    framebuffer: fb,
                    opacity: layer.opacity,
                    resolution: internalCanvasSize,
                    textureIdx: ensureTextureIsBound(context, textureId),
                    blocks: [
                        {
                            x0: 0,
                            y0: 0,
                            x1: internalCanvasSize.x,
                            y1: internalCanvasSize.y,
                        },
                    ],
                })
            }
        }
    }
    {
        // CURRENT
        const layerId = nextLayers.current
        const fb = setupFb(context, combinedLayers.current)
        if (layerId === null) {
            console.info("current layer is not selected")
        } else {
            const layerTextureId = getTextureIdForLayer(context, layerId.id)!
            textureRenderer.render(gl, {
                framebuffer: fb,
                opacity: 1,
                resolution: internalCanvasSize,
                textureIdx: ensureTextureIsBound(context, layerTextureId),
                blocks: [
                    {
                        x0: 0,
                        y0: 0,
                        x1: internalCanvasSize.x,
                        y1: internalCanvasSize.y,
                    },
                ],
            })
        }
    }

    // render to outputTexture
    const outId = context.outputTextureId
    const outFramebuffer = context.framebufferMap.get(outId)

    if (outFramebuffer == null) {
        throw "Out framebuffer should exist"
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, outFramebuffer)

    // need to clear the render blocks...
    clearBlocksRenderer.render(gl, {
        resolution,
        color: new RgbLinear(process.env.NODE_ENV === "development" ? 0.9 : 0.6, 0.6, 0.6),
        alpha: 1,
        framebuffer: outFramebuffer,
        blocks: context.renderBlocks.frameBlocks,
    })

    // BELOW
    textureRenderer.render(gl, {
        opacity: 1,
        resolution,
        framebuffer: outFramebuffer,
        textureIdx: ensureTextureIsBound(context, combinedLayers.below),
        blocks: context.renderBlocks.frameBlocks,
    })
    if (nextLayers.current !== null) {
        // CURRENT
        textureRenderer.render(gl, {
            opacity: nextLayers.current.opacity,
            resolution,
            framebuffer: outFramebuffer,
            textureIdx: ensureTextureIsBound(context, combinedLayers.current),
            blocks: context.renderBlocks.frameBlocks,
        })
    }
    // ABOVE
    textureRenderer.render(gl, {
        opacity: 1,
        resolution,
        framebuffer: outFramebuffer,
        textureIdx: ensureTextureIsBound(context, combinedLayers.above),
        blocks: context.renderBlocks.frameBlocks,
    })

    // outputTexture -> canvas
    outputRenderer.render(gl, {
        resolution,
        textureIdx: ensureTextureIsBound(context, outId),
        x0: 0,
        y0: 0,
        x1: resolution.x,
        y1: resolution.y,
    })

    gl.flush()
    //gl.finish()
    context.prevLayers = nextLayers
    context.renderBlocks = context.renderBlocks.withoutFrame()
}

function addFramebuffer(context: InternalContext, id: TextureId): WebGLFramebuffer {
    if (id === null) {
        throw "Id should not be null"
    }
    if (id === undefined) {
        throw "Id should not be undefined"
    }
    const { gl } = context
    const texture = context.textureMap.get(id)!
    const framebuf = gl.createFramebuffer()!

    if (context.framebufferMap.has(id)) {
        throw "Invariant violation: Attempted to add framebuffer to texture that already has a framebuffer associated. Texture id: "
    }

    context.framebufferMap.set(id, framebuf)

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuf)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)

    const frameBufferStatus = gl.checkFramebufferStatus(gl.FRAMEBUFFER)
    switch (frameBufferStatus) {
        case gl.FRAMEBUFFER_COMPLETE:
            break
        case gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
            console.warn("FRAMEBUFFER_INCOMPLETE_ATTACHMENT for texture:", id)
            break
        case gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
            console.warn("FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT for texture:", id)
            break
        case gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
            console.warn("FRAMEBUFFER_INCOMPLETE_DIMENSIONS for texture:", id)
            break
        case gl.FRAMEBUFFER_UNSUPPORTED:
            console.warn("FRAMEBUFFER_UNSUPPORTED for texture:", id)
            break
        default:
            throw "Unexpected status: " + frameBufferStatus
    }
    return framebuf
}

function setTextureSize(context: InternalContext, id: TextureId, size: Vec2): void {
    if (id === null) {
        throw "Id should not be null"
    }
    if (id === undefined) {
        throw "Id should not be undefined"
    }
    const { gl } = context
    ensureTextureIsBound(context, id)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size.x, size.y, 0, gl.RGBA, gl.FLOAT, null)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
}

function ensureTextureIsBound(context: InternalContext, id: TextureId): number {
    if (id === null) {
        throw "Id should not be null"
    }
    if (id === undefined) {
        throw "Id should not be undefined"
    }
    const { gl, textureBindings } = context
    for (let i = 0; i < textureBindings.length; i++) {
        if (textureBindings[i][0] === id) {
            gl.activeTexture(gl.TEXTURE0 + i)
            return i
        }
    }

    // Texture isn't bound yet. We need to find an open binding
    const texture = context.textureMap.get(id)
    if (texture == null) {
        throw "The given texture id should still be in use."
    }

    for (let i = 0; i < textureBindings.length; i++) {
        if (textureBindings[i][0] === null) {
            gl.activeTexture(gl.TEXTURE0 + i)
            gl.bindTexture(gl.TEXTURE_2D, texture)
            textureBindings[i] = [id, performance.now()]
            return i
        }
    }

    // There is no open binding. We need to replace something that's already bound.
    {
        let minTime = Number.MAX_VALUE
        let minTimeIdx = 0
        for (let i = 0; i < textureBindings.length; i++) {
            const time = textureBindings[i][1]
            if (time < minTime) {
                minTime = time
                minTimeIdx = i
            }
        }
        gl.activeTexture(gl.TEXTURE0 + minTimeIdx)
        gl.bindTexture(gl.TEXTURE_2D, texture)
        textureBindings[minTimeIdx] = [id, performance.now()]
        return minTimeIdx
    }
}

function setupFb(context: InternalContext, id: TextureId): WebGLFramebuffer {
    const { gl, framebufferMap } = context
    const fb = framebufferMap.get(id)
    if (fb == null) {
        throw { "framebuffer should exist": id, framebufferMap }
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    return fb
}

function layersRequireRerender(
    prev: ReadonlyArray<Layers.CollectedLayer>,
    next: ReadonlyArray<Layers.CollectedLayer>
): boolean {
    if (prev.length !== next.length) return true
    for (let i = 0; i < next.length; i++) {
        if (prev[i].id !== next[i].id) {
            return true
        }
    }
    return false
}

function getTextureIdForLayer(context: InternalContext, layerId: Layers.Id): TextureId {
    if (layerId === null) {
        throw "Id should not be null"
    }
    if (layerId === undefined) {
        throw "Id should not be undefined"
    }
    const layerTextureId = context.layerTextureMap.get(layerId)
    if (layerTextureId !== undefined) {
        return layerTextureId
    }

    const textureId = createTexture(context, context.internalCanvasSize)
    addFramebuffer(context, textureId)
    context.layerTextureMap.set(layerId, textureId)
    return textureId
}

const PX_PER_BLOCK_X = 32
const PX_PER_BLOCK_Y = 32

class Block {
    static lessThan(l: Block, r: Block): boolean {
        return l.x < r.x || (l.x === r.x && l.y < r.y)
    }

    readonly x0: number
    readonly y0: number
    readonly x1: number
    readonly y1: number

    private nominal: void
    constructor(readonly x: number, readonly y: number) {
        this.x0 = x * PX_PER_BLOCK_X
        this.y0 = y * PX_PER_BLOCK_Y
        this.x1 = (x + 1) * PX_PER_BLOCK_X
        this.y1 = (y + 1) * PX_PER_BLOCK_Y
    }

    eq(other: Block): boolean {
        return this.x === other.x && this.y === other.y
    }
}

class RenderBlocks {
    static EMPTY: RenderBlocks = new RenderBlocks([], [])

    private nominal: void
    private constructor(
        readonly frameBlocks: ReadonlyArray<Block>,
        readonly strokeBlocks: ReadonlyArray<Block>
    ) {}

    withFrame(brushPoints: ReadonlyArray<BrushShader.BrushPoint>): RenderBlocks {
        if (brushPoints.length === 0) {
            return this
        }

        const frameBlocks = this.frameBlocks.slice()
        for (let i = 0; i < brushPoints.length; i++) {
            // 1. find minimum intersection point
            // 2. find maximum intersection point
            // 3. fill in every in between
            // assume the texture is circular with its max radius being width / 2
            const point = brushPoints[i]

            const radius = point.scaledDiameter / 2
            const xMin = point.position.x - radius
            const yMin = point.position.y - radius
            const xMax = point.position.x + radius
            const yMax = point.position.y + radius

            const xBlockMin = (xMin / PX_PER_BLOCK_X) | 0
            const yBlockMin = (yMin / PX_PER_BLOCK_Y) | 0

            const xBlockMax = Math.ceil(xMax / PX_PER_BLOCK_X) | 0
            const yBlockMax = Math.ceil(yMax / PX_PER_BLOCK_Y) | 0

            for (let y = yBlockMin; y <= yBlockMax; y++) {
                for (let x = xBlockMin; x <= xBlockMax; x++) {
                    const block = new Block(x, y)
                    // check if it already exists
                    let exists = false
                    for (let i = 0; i < frameBlocks.length; i++) {
                        if (frameBlocks[i].eq(block)) {
                            exists = true
                            break
                        }
                    }
                    if (!exists) {
                        frameBlocks.push(block)
                    }
                }
            }
        }

        const strokeBlocks = this.strokeBlocks.slice()

        // union, no duplicates
        for (let i = 0; i < frameBlocks.length; i++) {
            const block = frameBlocks[i]
            let exists = false
            for (let j = 0; j < strokeBlocks.length; j++) {
                if (block.eq(strokeBlocks[j])) {
                    exists = true
                    break
                }
            }
            if (!exists) {
                strokeBlocks.push(block)
            }
        }

        return new RenderBlocks(frameBlocks, strokeBlocks)
    }

    withoutFrame(): RenderBlocks {
        return new RenderBlocks([], this.strokeBlocks)
    }
}
