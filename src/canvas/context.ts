import * as OutputShader from "./outputShader"
import * as BrushTextureShader from "./brushTextureGenerator"
import * as TextureShader from "./textureShader"
import * as ClearBlocksShader from "./clearBlocksShader"
import * as BrushShader from "./brushShader"
import * as Layers from "../layers/model"
import * as BlockRender from "./blockRender"
import { Blend } from "../webgl"
import { Result, Vec2, Vec4 } from "../util"
import { RgbLinear } from "color"
import { Texture, TextureId, createTextureWithFramebuffer, ensureTextureIsBound } from "./texture"
import * as Render from "./render"

export interface CreationArgs {
    readonly gl: WebGLRenderingContext
    readonly brushTextureGenerator: BrushTextureShader.Generator
    readonly textureRenderer: TextureShader.Shader
    readonly clearBlocksRenderer: ClearBlocksShader.Shader
    readonly outputRenderer: OutputShader.Shader
    readonly drawpointBatch: BrushShader.Shader
    readonly resolution: Vec2
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
    addBrushPoints(brushPoints: readonly BrushShader.BrushPoint[]): void
    endStroke(): void
    render(args: RenderArgs): void
    dispose(): void
}

declare global {
    interface WebGLContextAttributes {
        readonly desynchronized: boolean
    }
}

export function create(
    canvas: HTMLCanvasElement
): Result<[Context, WebGLRenderingContext], string> {
    const wglArgs: WebGLContextAttributes = {
        antialias: false,
        depth: false,
        alpha: false,
        premultipliedAlpha: false,
        stencil: false,
        preserveDrawingBuffer: true,
        desynchronized: true,
    }
    const gl = canvas.getContext("webgl", wglArgs)
    if (gl === null) {
        console.error("Failed to initialize WebGL renderer for canvas: ", canvas)
        return Result.err("Failed to initialize WebGL")
    }
    const attrs = gl.getContextAttributes()
    if (!(attrs && attrs.desynchronized)) {
        console.warn("Low latency canvas not supported. Boo!")
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
        resolution: new Vec2(canvas.width, canvas.height),
    })
    return Result.ok<[Context, WebGLRenderingContext], string>([context, gl])
}

class InternalContext implements Context {
    readonly gl: WebGLRenderingContext
    readonly brushTextureGenerator: BrushTextureShader.Generator
    readonly textureRenderer: TextureShader.Shader
    readonly clearBlocksRenderer: ClearBlocksShader.Shader
    readonly outputRenderer: OutputShader.Shader
    readonly drawpointBatch: BrushShader.Shader
    readonly allTextures: Texture[]
    readonly textureBindings: (readonly [TextureId | null, number])[]
    readonly layerTextureMap: Map<Layers.Id, Texture>
    internalCanvasSize: Vec2
    stroke: Texture | null
    renderBlocks: BlockRender.BlockTracker
    prevLayers: Layers.SplitLayers
    readonly brushTexture: Texture
    readonly outputTexture: Texture
    readonly combinedLayers: {
        readonly above: Texture
        readonly below: Texture
        readonly current: Texture
    }

    constructor(args: CreationArgs) {
        this.gl = args.gl
        this.brushTextureGenerator = args.brushTextureGenerator
        this.textureRenderer = args.textureRenderer
        this.clearBlocksRenderer = args.clearBlocksRenderer
        this.outputRenderer = args.outputRenderer
        this.drawpointBatch = args.drawpointBatch
        this.allTextures = []
        this.textureBindings = new Array(32).fill([null, 0])
        this.layerTextureMap = new Map()
        this.internalCanvasSize = args.resolution
        this.stroke = null
        this.renderBlocks = new BlockRender.BlockTracker()
        this.prevLayers = {
            above: [],
            below: [],
            current: null,
        }
        {
            const size = new Vec2(128, 128)
            this.brushTexture = createTextureWithFramebuffer(
                this.gl,
                this.allTextures,
                this.textureBindings,
                size
            )
            this.brushTextureGenerator.generateBrushTexture(this.gl, {
                framebuffer: this.brushTexture.framebuffer,
                size: size,
                uniforms: {
                    u_softness: 0,
                },
            })
        }
        this.outputTexture = createTextureWithFramebuffer(
            this.gl,
            this.allTextures,
            this.textureBindings,
            args.resolution
        )
        const outFramebuffer = this.outputTexture.framebuffer
        this.combinedLayers = {
            above: createTextureWithFramebuffer(
                this.gl,
                this.allTextures,
                this.textureBindings,
                args.resolution
            ),
            below: createTextureWithFramebuffer(
                this.gl,
                this.allTextures,
                this.textureBindings,
                args.resolution
            ),
            current: createTextureWithFramebuffer(
                this.gl,
                this.allTextures,
                this.textureBindings,
                args.resolution
            ),
        }

        // initialize background
        this.gl.bindFramebuffer(WebGLRenderingContext.FRAMEBUFFER, outFramebuffer)
        this.gl.viewport(0, 0, args.resolution.x, args.resolution.y)
        this.gl.clearColor(0.6, 0.6, 0.6, 1)
        this.gl.clear(WebGLRenderingContext.COLOR_BUFFER_BIT)
        this.outputRenderer.render(this.gl, {
            uniforms: {
                u_resolution: args.resolution,
                u_texture: ensureTextureIsBound(this.gl, this.textureBindings, this.outputTexture),
            },
            blocks: [
                {
                    x0: 0,
                    y0: 0,
                    x1: args.resolution.x,
                    y1: args.resolution.y,
                },
            ],
        })
    }

    addBrushPoints(brushPoints: readonly BrushShader.BrushPoint[]) {
        this.drawpointBatch.addPoints(brushPoints)
        this.renderBlocks.addPoints(brushPoints)
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
        for (const x of this.allTextures) {
            gl.deleteTexture(x.texture)
            if (x instanceof Texture) {
                gl.deleteFramebuffer(x.framebuffer)
            }
        }
    }
}

function endStroke(context: InternalContext): void {
    const { gl, stroke, prevLayers, internalCanvasSize } = context
    if (stroke === null) return
    if (prevLayers.current === null) return

    gl.viewport(0, 0, context.internalCanvasSize.x, context.internalCanvasSize.y)
    context.textureRenderer.render(gl, {
        framebuffer: context.combinedLayers.current.framebuffer,
        uniforms: {
            u_opacity: 1,
            u_resolution: internalCanvasSize,
            u_texture: ensureTextureIsBound(context.gl, context.textureBindings, stroke),
        },
        blocks: context.renderBlocks.getStrokeBlocks(),
    })

    gl.bindFramebuffer(gl.FRAMEBUFFER, stroke.framebuffer)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    context.renderBlocks.strokeEnded()
}

function render(
    context: InternalContext,
    { blendMode, nextLayers, resolution, brush }: RenderArgs
): void {
    const frameBlocks = context.renderBlocks.getFrameBlocks()
    if (frameBlocks.length === 0) {
        return
    }

    const { gl } = context

    if (context.drawpointBatch.canFlush) {
        if (nextLayers.current === null) {
            console.warn("Drawpoint batch has data to flush, but no layer is currently selected")
        } else {
            let currentLayerTex = context.layerTextureMap.get(nextLayers.current.id)

            if (currentLayerTex == null) {
                currentLayerTex = createTextureWithFramebuffer(
                    context.gl,
                    context.allTextures,
                    context.textureBindings,
                    context.internalCanvasSize
                )
                context.layerTextureMap.set(nextLayers.current.id, currentLayerTex)
            }

            const { brushTexture } = context

            context.brushTextureGenerator.generateBrushTexture(gl, {
                framebuffer: brushTexture.framebuffer,
                size: new Vec2(128, 128),
                uniforms: {
                    u_softness: Math.max(brush.softness, 0.000001),
                },
            })
            gl.viewport(0, 0, resolution.x, resolution.y)
            gl.bindFramebuffer(gl.FRAMEBUFFER, currentLayerTex.framebuffer)
            context.drawpointBatch.flush(gl, {
                blendMode,
                uniforms: {
                    u_resolution: resolution,
                    u_texture: ensureTextureIsBound(
                        context.gl,
                        context.textureBindings,
                        brushTexture
                    ),
                },
            })
        }
    }

    const layersToCombine = Render.getLayersToCombine(context.prevLayers, nextLayers)
    Render.combineLayers({
        gl,
        resolution,
        allTextures: context.allTextures,
        layerTextureMap: context.layerTextureMap,
        textureBindings: context.textureBindings,
        textureShader: context.textureRenderer,
        layersToRender: layersToCombine,
        textureAbove: context.combinedLayers.above,
        textureBelow: context.combinedLayers.below,
        textureCurrent: context.combinedLayers.current,
    })

    // render to outputTexture
    const outFramebuffer = context.outputTexture.framebuffer

    if (outFramebuffer == null) {
        throw "Out framebuffer should exist"
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, outFramebuffer)

    {
        // need to clear the render blocks...
        const bgColor = new RgbLinear(process.env.NODE_ENV === "development" ? 0.9 : 0.6, 0.6, 0.6)
        context.clearBlocksRenderer.render(gl, {
            framebuffer: outFramebuffer,
            uniforms: {
                u_resolution: resolution,
                u_rgba: Vec4.fromRgba(bgColor, 1),
            },
            blocks: frameBlocks,
        })
    }

    // BELOW
    context.textureRenderer.render(gl, {
        framebuffer: outFramebuffer,
        uniforms: {
            u_opacity: 1,
            u_resolution: resolution,
            u_texture: ensureTextureIsBound(
                context.gl,
                context.textureBindings,
                context.combinedLayers.below
            ),
        },
        blocks: frameBlocks,
    })
    if (nextLayers.current !== null) {
        // CURRENT
        context.textureRenderer.render(gl, {
            framebuffer: outFramebuffer,
            uniforms: {
                u_opacity: nextLayers.current.opacity,
                u_resolution: resolution,
                u_texture: ensureTextureIsBound(
                    context.gl,
                    context.textureBindings,
                    context.combinedLayers.current
                ),
            },
            blocks: frameBlocks,
        })
    }
    // ABOVE
    context.textureRenderer.render(gl, {
        framebuffer: outFramebuffer,
        uniforms: {
            u_opacity: 1,
            u_resolution: resolution,
            u_texture: ensureTextureIsBound(
                context.gl,
                context.textureBindings,
                context.combinedLayers.above
            ),
        },
        blocks: frameBlocks,
    })

    // outputTexture -> canvas
    // I'm not sure if can use block rendering when rendering to canvas - unless there's something I'm missing, it seems that the canvas auto-clears itself before render
    context.outputRenderer.render(gl, {
        uniforms: {
            u_resolution: resolution,
            u_texture: ensureTextureIsBound(
                context.gl,
                context.textureBindings,
                context.outputTexture
            ),
        },
        blocks: frameBlocks,
    })

    gl.flush()
    //gl.finish()
    context.prevLayers = nextLayers
    context.renderBlocks.afterFrame()
}
