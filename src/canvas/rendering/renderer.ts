import { BlendMode, blendModeMap } from "./blendMode"
import { BrushShader } from "./brushShader"
import { Rgb, T2, Vec4, Vec2 } from "../../data"
import { BrushTextureGenerator } from "./brushTextureGenerator"
import { TextureManager, Texture } from "./texture"

const contextAttributes: WebGLContextAttributes = {
    antialias: false,
    depth: false,
    alpha: true,
    premultipliedAlpha: false,
    stencil: false,
}

export interface Compatibility {
    readonly maxBoundTextures: number
    readonly supportsFloat: boolean
    readonly supportsHalfFloat: boolean
}

export interface Shaders {
    readonly brushTextureGenerator: BrushTextureGenerator
}

export class Renderer {
    static create(canvas: HTMLCanvasElement): Renderer | null {
        const gl = canvas.getContext("webgl", contextAttributes)
        if (gl === null) {
            console.error("Failed to initialize WebGL renderer for canvas: ", canvas)
            return null
        }

        const floatLinearFiltering = gl.getExtension("OES_texture_float_linear")
        if (floatLinearFiltering === null)
            console.warn(`Couldn't enable "OES_texture_float_linear"`)

        const floatTexture = gl.getExtension("OES_texture_float")
        if (floatTexture === null) console.warn(`Couldn't enable "OES_texture_float"`)

        // TODO: check for half-float

        // TODO: check for max textures

        const compat: Compatibility = {
            maxBoundTextures: 32,
            supportsFloat: floatLinearFiltering !== null && floatTexture !== null,
            supportsHalfFloat: false,
        }

        const brushShader = BrushShader.create(gl)
        if (brushShader === null) {
            console.error("Failed to initialize BrushShader")
            return null
        }

        const brushTextureGenerator = BrushTextureGenerator.create(gl)
        if (brushTextureGenerator === null) {
            console.error("Failed to initialize BrushTextureGenerator")
            return null
        }

        const shaders: Shaders = { brushTextureGenerator }

        return new Renderer(gl, compat, shaders, initState(gl))
    }

    private textureManager: TextureManager

    private constructor(
        readonly gl: WebGLRenderingContext,
        readonly compatibility: Compatibility,
        readonly shaders: Shaders,
        private readonly state: RenderState
    ) {
        gl.enable(WebGLRenderingContext.BLEND)
        gl.disable(WebGLRenderingContext.DEPTH_TEST)
        this.textureManager = new TextureManager(compatibility.maxBoundTextures)
    }

    getCanvasResolution(): Vec2 {
        const canv = this.gl.canvas
        return new Vec2(canv.width, canv.height)
    }

    setBlendMode(blendMode: BlendMode): void {
        if (blendMode === this.state.blendMode) return

        this.state.blendMode = blendMode
        applyBlendMode(this.gl, this.state)
    }

    setViewport(viewport: Vec4): void {
        if (viewport.eq(this.state.viewport)) return

        this.state.viewport = viewport
        applyViewport(this.gl, this.state)
    }

    setProgram(program: WebGLProgram | null): void {
        if (program === this.state.program) return

        this.state.program = program
        applyProgram(this.gl, this.state)
    }

    setFramebuffer(framebuffer: WebGLFramebuffer | null): void {
        if (framebuffer === this.state.framebuffer) return

        this.state.framebuffer = framebuffer
        applyFramebuffer(this.gl, this.state)
    }

    setClearColor(rgb: Rgb, alpha: number): void {
        if (rgb.eq(this.state.clearColor[0]) && alpha === this.state.clearColor[1]) return

        this.state.clearColor = [rgb, alpha]
        applyClearColor(this.gl, this.state)
    }

    clear(): void {
        this.gl.clear(WebGLRenderingContext.COLOR_BUFFER_BIT)
    }

    createTexture(size: Vec2): Texture {
        return this.textureManager.createTexture(this, size)
    }

    bindTexture(texture: Texture): number {
        return this.textureManager.bindTexture(this.gl, texture)
    }

    dispose(): void {
        this.shaders.brushTextureGenerator.dispose(this.gl)
    }
}

interface RenderState {
    blendMode: BlendMode
    viewport: Vec4
    program: WebGLProgram | null
    framebuffer: WebGLFramebuffer | null
    clearColor: T2<Rgb, number>
}

function initState(gl: WebGLRenderingContext): RenderState {
    const canvas = gl.canvas
    const state: RenderState = {
        blendMode: BlendMode.Normal,
        viewport: new Vec4(0, 0, canvas.width, canvas.height),
        program: null,
        framebuffer: null,
        clearColor: [Rgb.Black, 0],
    }
    applyBlendMode(gl, state)
    applyViewport(gl, state)
    applyProgram(gl, state)
    applyFramebuffer(gl, state)
    applyClearColor(gl, state)
    return state
}

function applyBlendMode(gl: WebGLRenderingContext, state: { readonly blendMode: BlendMode }): void {
    const blendArgs = blendModeMap[state.blendMode]
    gl.blendFunc(blendArgs.sfact, blendArgs.dfact)
}

function applyViewport(gl: WebGLRenderingContext, state: { readonly viewport: Vec4 }): void {
    const { viewport } = state
    gl.viewport(viewport.x, viewport.y, viewport.z, viewport.w)
}

function applyProgram(
    gl: WebGLRenderingContext,
    state: { readonly program: WebGLProgram | null }
): void {
    gl.useProgram(state.program)
}

function applyFramebuffer(
    gl: WebGLRenderingContext,
    state: { readonly framebuffer: WebGLFramebuffer | null }
): void {
    gl.bindFramebuffer(WebGLRenderingContext.FRAMEBUFFER, state.framebuffer)
}

function applyClearColor(
    gl: WebGLRenderingContext,
    state: { readonly clearColor: T2<Rgb, number> }
): void {
    const color = state.clearColor[0]
    const alpha = state.clearColor[1]
    gl.clearColor(color.r, color.g, color.b, alpha)
}
