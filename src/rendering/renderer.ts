import * as BlendMode from "./blendMode"
import * as BrushShader from "./brushShader"
import * as BrushTextureShader from "./brushTextureGenerator"
import * as Texture from "./texture"
import * as TextureShader from "./textureShader"
import * as Color from "../color"
import { T2, Vec2, Vec4 } from "../util"

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
    readonly brushTextureGenerator: BrushTextureShader.Generator
    readonly textureShader: TextureShader.Shader
}

export class Renderer {
    static create(canvas: HTMLCanvasElement): Renderer | null {
        const gl = canvas.getContext("webgl2", contextAttributes)
        if (gl === null) {
            console.error("Failed to initialize WebGL renderer for canvas: ", canvas)
            return null
        }

        gl.enable(WebGLRenderingContext.BLEND)
        gl.disable(WebGLRenderingContext.DEPTH_TEST)

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

        const brushShader = BrushShader.Shader.create(gl)
        if (brushShader === null) {
            console.error("Failed to initialize BrushShader")
            return null
        }

        const brushTextureGenerator = BrushTextureShader.Generator.create(gl)
        if (brushTextureGenerator === null) {
            console.error("Failed to initialize BrushTextureGenerator")
            return null
        }

        const textureShader = TextureShader.Shader.create(gl)
        if (textureShader === null) {
            console.error("Failed to initialize TextureShader")
            return null
        }

        const shaders: Shaders = { brushTextureGenerator, textureShader }

        return new Renderer(gl, compat, shaders, initState(gl))
    }

    private readonly textureManager: Texture.TextureManager

    private constructor(
        readonly gl: WebGL2RenderingContext,
        readonly compatibility: Compatibility,
        readonly shaders: Shaders,
        private readonly state: GlState
    ) {
        this.textureManager = new Texture.TextureManager(compatibility.maxBoundTextures)
    }

    getCanvasResolution(): Vec2 {
        const { width, height } = this.gl.canvas
        return new Vec2(width, height)
    }

    setBlendMode(blendMode: BlendMode.Mode): void {
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

    setClearColor(rgb: Color.Rgb, alpha: number): void {
        console.log("Clear!", this.state.clearColor)
        if (rgb.eq(this.state.clearColor[0]) && alpha === this.state.clearColor[1]) return

        this.state.clearColor = [rgb, alpha]
        applyClearColor(this.gl, this.state)
    }

    clear(): void {
        this.gl.clear(WebGLRenderingContext.COLOR_BUFFER_BIT)
    }

    createTexture(size: Vec2): Texture.Texture {
        return this.textureManager.createTexture(this, size)
    }

    bindTexture(texture: Texture.Texture): number {
        return this.textureManager.bindTexture(this.gl, texture)
    }

    dispose(): void {
        this.shaders.brushTextureGenerator.dispose(this.gl)
    }
}

interface GlState {
    blendMode: BlendMode.Mode
    viewport: Vec4
    program: WebGLProgram | null
    framebuffer: WebGLFramebuffer | null
    clearColor: T2<Color.Rgb, number>
}

function initState(gl: WebGL2RenderingContext): GlState {
    const canvas = gl.canvas
    const state: GlState = {
        blendMode: BlendMode.Mode.Normal,
        viewport: new Vec4(0, 0, canvas.width, canvas.height),
        program: null,
        framebuffer: null,
        clearColor: [Color.Rgb.Black, 0],
    }
    applyBlendMode(gl, state)
    applyViewport(gl, state)
    applyProgram(gl, state)
    applyFramebuffer(gl, state)
    applyClearColor(gl, state)
    return state
}

function applyBlendMode(
    gl: WebGL2RenderingContext,
    state: { readonly blendMode: BlendMode.Mode }
): void {
    const blendArgs = BlendMode.modeMap[state.blendMode]
    gl.blendFunc(blendArgs.sfact, blendArgs.dfact)
}

function applyViewport(gl: WebGL2RenderingContext, state: { readonly viewport: Vec4 }): void {
    const { viewport } = state
    gl.viewport(viewport.x, viewport.y, viewport.z, viewport.w)
}

function applyProgram(
    gl: WebGL2RenderingContext,
    state: { readonly program: WebGLProgram | null }
): void {
    gl.useProgram(state.program)
}

function applyFramebuffer(
    gl: WebGL2RenderingContext,
    state: { readonly framebuffer: WebGLFramebuffer | null }
): void {
    gl.bindFramebuffer(WebGLRenderingContext.FRAMEBUFFER, state.framebuffer)
}

function applyClearColor(
    gl: WebGL2RenderingContext,
    state: { readonly clearColor: T2<Color.Rgb, number> }
): void {
    const color = state.clearColor[0]
    const alpha = state.clearColor[1]
    gl.clearColor(color.r, color.g, color.b, alpha)
}
