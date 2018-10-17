import * as OutputShader from "./outputShader"
import * as BrushTextureShader from "./brushTextureGenerator"
import * as TextureShader from "./textureShader"
import * as BrushShader from "./brushShader"
import * as Layers from "../layers/model"
import { Blend } from "../webgl"
import { T2, Vec4, Result, Vec2, Brand } from "../util"

export interface CreationArgs {
    readonly gl: WebGLRenderingContext
    readonly brushTextureGenerator: BrushTextureShader.Generator
    readonly textureRenderer: TextureShader.Shader
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

export function create(canvas: HTMLCanvasElement): Result<Context, string> {
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
        internalCanvasSize: new Vec2(canvas.width, canvas.height),
    })
    return Result.ok(context)
}

type TextureId = Brand<"Texture Id", number>

interface Stroke {
    readonly textureId: TextureId
    readonly affectedArea: Vec4
}

interface ContextState {
    readonly gl: WebGLRenderingContext
    readonly brushTextureGenerator: BrushTextureShader.Generator
    readonly textureRenderer: TextureShader.Shader
    readonly outputRenderer: OutputShader.Shader
    readonly drawpointBatch: BrushShader.Shader
    readonly textureMap: Map<TextureId, WebGLTexture>
    readonly framebufferMap: Map<TextureId, WebGLFramebuffer>
    readonly textureBindings: Array<T2<TextureId | null, number>>
    readonly layerTextureMap: Map<Layers.Id, TextureId>
    internalCanvasSize: Vec2
    stroke: Stroke | null
    prevLayers: Layers.SplitLayers
    readonly brushTextureId: TextureId
    readonly currentLayerTextureId: TextureId
    readonly outputTextureId: TextureId
    readonly combinedLayers: {
        readonly above: TextureId
        readonly below: TextureId
        readonly current: TextureId
    }
}

class InternalContext implements Context, ContextState {
    readonly gl: WebGLRenderingContext
    readonly brushTextureGenerator: BrushTextureShader.Generator
    readonly textureRenderer: TextureShader.Shader
    readonly outputRenderer: OutputShader.Shader
    readonly drawpointBatch: BrushShader.Shader
    readonly textureMap: Map<TextureId, WebGLTexture>
    readonly framebufferMap: Map<TextureId, WebGLFramebuffer>
    readonly textureBindings: Array<T2<TextureId | null, number>>
    readonly layerTextureMap: Map<Layers.Id, TextureId>
    internalCanvasSize: Vec2
    stroke: Stroke | null
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
        this.outputRenderer = args.outputRenderer
        this.drawpointBatch = args.drawpointBatch
        this.textureMap = new Map()
        this.framebufferMap = new Map()
        this.textureBindings = new Array(32).fill([null, 0])
        this.layerTextureMap = new Map()
        this.internalCanvasSize = args.internalCanvasSize
        this.stroke = null
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
        console.info("context", this)
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
        Math.min(prevArea.z, nextArea.z),
        Math.min(prevArea.w, nextArea.w)
    )
}

function addBrushPoints(
    context: ContextState,
    brushPoints: ReadonlyArray<BrushShader.BrushPoint>
): void {
    context.drawpointBatch.addPoints(brushPoints)
    if (context.stroke == null) {
        context.stroke = {
            textureId: createTexture(context, context.internalCanvasSize),
            affectedArea: context.drawpointBatch.getAffectedArea(),
        }
        addFramebuffer(context, context.stroke.textureId)
    } else {
        const affectedArea = mergeAreas(
            context.stroke.affectedArea,
            context.drawpointBatch.getAffectedArea()
        )
        context.stroke = { textureId: context.stroke.textureId, affectedArea }
    }
}

function endStroke(context: ContextState): void {
    const { gl, stroke, prevLayers, internalCanvasSize } = context
    if (stroke === null) return
    if (prevLayers.current === null) return

    gl.viewport(0, 0, context.internalCanvasSize.x, context.internalCanvasSize.y)
    context.textureRenderer.render(gl, {
        opacity: 1,
        framebuffer: context.framebufferMap.get(context.combinedLayers.current)!,
        resolution: internalCanvasSize,
        textureIdx: ensureTextureIsBound(context, stroke.textureId),
        x0: 0,
        y0: 0,
        x1: internalCanvasSize.x,
        y1: internalCanvasSize.y,
    })

    const strokeFb = context.framebufferMap.get(stroke.textureId)
    if (strokeFb == null) {
        throw "Stroke framebuffer not found"
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, strokeFb)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
}

function render(
    context: ContextState,
    { blendMode, nextLayers, resolution, brush }: RenderArgs
): void {
    const { gl, combinedLayers, textureRenderer, outputRenderer } = context
    if (context.drawpointBatch.canFlush) {
        if (nextLayers.current !== null) {
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
        } else {
            console.warn("Drawpoint batch has data to flush, but no layer is currently selected")
        }
    }
    combineLayers(context, nextLayers)

    // render to outputTexture
    const outId = context.outputTextureId
    const outFramebuffer = context.framebufferMap.get(outId)

    if (outFramebuffer == null) {
        throw "Out framebuffer should exist"
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, outFramebuffer)
    gl.viewport(0, 0, resolution.x, resolution.y)
    gl.clearColor(0.6, 0.6, 0.6, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)

    // BELOW
    textureRenderer.render(gl, {
        opacity: 1,
        resolution,
        framebuffer: outFramebuffer,
        textureIdx: ensureTextureIsBound(context, combinedLayers.below),
        x0: 0,
        y0: 0,
        x1: resolution.x,
        y1: resolution.y,
    })
    if (nextLayers.current !== null) {
        // CURRENT
        textureRenderer.render(gl, {
            opacity: nextLayers.current.opacity,
            resolution,
            framebuffer: outFramebuffer,
            textureIdx: ensureTextureIsBound(context, combinedLayers.current),
            x0: 0,
            y0: 0,
            x1: resolution.x,
            y1: resolution.y,
        })
    }
    // ABOVE
    textureRenderer.render(gl, {
        opacity: 1,
        resolution,
        framebuffer: outFramebuffer,
        textureIdx: ensureTextureIsBound(context, combinedLayers.above),
        x0: 0,
        y0: 0,
        x1: resolution.x,
        y1: resolution.y,
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
}

const createTexture = (() => {
    let nextId = 1

    function createTexture(context: ContextState, size: Vec2): TextureId {
        const texture = context.gl.createTexture()!
        const id = (nextId++ as any) as TextureId

        console.info("created texture with id", id)

        context.textureMap.set(id, texture)
        setTextureSize(context, id, size)

        return id
    }

    return createTexture
})()

function addFramebuffer(context: ContextState, id: TextureId): WebGLFramebuffer {
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

function setTextureSize(context: ContextState, id: TextureId, size: Vec2): void {
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

function ensureTextureIsBound(context: ContextState, id: TextureId): number {
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

function combineLayers(context: ContextState, nextLayers: Layers.SplitLayers): void {
    const { gl, prevLayers, combinedLayers, textureRenderer, internalCanvasSize } = context
    {
        // ABOVE
        const prev = prevLayers.above
        const next = nextLayers.above
        let requiresRerender = prev.length !== next.length
        if (!requiresRerender) {
            for (let i = 0; i < next.length; i++) {
                if (prev[i].id !== next[i].id) {
                    requiresRerender = true
                    break
                }
            }
        }
        if (requiresRerender) {
            console.log("context", context, nextLayers)
            const fb = context.framebufferMap.get(combinedLayers.above)
            if (fb == null) {
                throw "framebuffer should exist"
            }
            gl.bindFramebuffer(gl.FRAMEBUFFER, fb)
            gl.clearColor(0, 0, 0, 0)
            gl.clear(gl.COLOR_BUFFER_BIT)
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
                    x0: 0,
                    y0: 0,
                    x1: internalCanvasSize.x,
                    y1: internalCanvasSize.y,
                })
            }
        }
    }
    {
        // BELOW
        const prev = prevLayers.below
        const next = nextLayers.below
        let requiresRerender = prev.length !== next.length
        if (!requiresRerender) {
            for (let i = 0; i < next.length; i++) {
                if (prev[i].id !== next[i].id) {
                    requiresRerender = true
                    break
                }
            }
        }
        if (requiresRerender) {
            console.log("context", context, nextLayers)
            const fb = context.framebufferMap.get(combinedLayers.below)
            if (fb == null) {
                throw "framebuffer should exist"
            }
            gl.bindFramebuffer(gl.FRAMEBUFFER, fb)
            gl.clearColor(0, 0, 0, 0)
            gl.clear(gl.COLOR_BUFFER_BIT)
            for (let i = next.length - 1; i >= 0; i--) {
                const layer = next[i]
                if (layer.opacity === 0) continue

                const textureId = getTextureIdForLayer(context, layer.id)!

                textureRenderer.render(gl, {
                    framebuffer: fb,
                    opacity: layer.opacity,
                    resolution: internalCanvasSize,
                    textureIdx: ensureTextureIsBound(context, textureId),
                    x0: 0,
                    y0: 0,
                    x1: internalCanvasSize.x,
                    y1: internalCanvasSize.y,
                })
            }
        }
    }
    {
        // CURRENT
        const layerId = nextLayers.current
        const fb = context.framebufferMap.get(combinedLayers.current)
        if (fb == null) {
            throw "framebuffer should exist"
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb)
        gl.clearColor(0, 0, 0, 0)
        gl.clear(gl.COLOR_BUFFER_BIT)
        if (layerId !== null) {
            const layerTextureId = getTextureIdForLayer(context, layerId.id)!
            textureRenderer.render(gl, {
                framebuffer: fb,
                opacity: 1,
                resolution: internalCanvasSize,
                textureIdx: ensureTextureIsBound(context, layerTextureId),
                x0: 0,
                y0: 0,
                x1: internalCanvasSize.x,
                y1: internalCanvasSize.y,
            })
            const stroke = context.stroke
            if (stroke !== null) {
                const strokeTextureId = stroke.textureId
                textureRenderer.render(gl, {
                    framebuffer: fb,
                    opacity: 1,
                    resolution: internalCanvasSize,
                    textureIdx: ensureTextureIsBound(context, strokeTextureId),
                    x0: 0,
                    y0: 0,
                    x1: internalCanvasSize.x,
                    y1: internalCanvasSize.y,
                })
            }
        } else {
            console.info("current layer is not selected")
        }
    }
}

function getTextureIdForLayer(context: ContextState, layerId: Layers.Id): TextureId {
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
