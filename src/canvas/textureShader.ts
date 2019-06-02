import { Blend, createProgram, getUniformLocation } from "../webgl"
import { Vec2 } from "../util"

const floatsPerVertex = 2
const batchStride = floatsPerVertex * 4

const VERT_SRC = `
precision highp float;

attribute vec2 a_position;

uniform vec2 u_resolution;

varying vec2 v_tex_coords;

void main() {
    vec2 pos = a_position / u_resolution;
    pos.y = 1.0 - pos.y;
    pos = pos * 2.0;
    pos = pos - 1.0;
    gl_Position = vec4(pos, 0.0, 1.0);
    
    v_tex_coords = a_position / u_resolution;
}
`

const FRAG_SRC = `
precision highp float;

varying vec2 v_tex_coords;

uniform sampler2D u_texture;
uniform float u_opacity;

void main() {
    vec4 pixel = texture2D(u_texture, v_tex_coords);
    gl_FragColor = pixel * u_opacity;
}
`

export interface Args {
    readonly opacity: number
    readonly resolution: Vec2
    readonly framebuffer: WebGLFramebuffer
    readonly textureIdx: number
    readonly blocks: ReadonlyArray<{
        readonly x0: number
        readonly y0: number
        readonly x1: number
        readonly y1: number
    }>
}

export class Shader {
    static create(gl: WebGLRenderingContext): Shader | null {
        const program = createProgram(gl, VERT_SRC, FRAG_SRC)
        if (program === null) return null

        gl.bindAttribLocation(program, 0, "a_position")

        const textureUniform = getUniformLocation(gl, program, "u_texture")
        if (textureUniform === null) return null

        const resolutionUniform = getUniformLocation(gl, program, "u_resolution")
        if (resolutionUniform === null) return null

        const opacityUniform = getUniformLocation(gl, program, "u_opacity")
        if (opacityUniform === null) return null

        return new Shader(gl, program, textureUniform, resolutionUniform, opacityUniform)
    }

    private readonly buffer: WebGLBuffer
    private array: Float32Array
    private capacity = 1024

    private constructor(
        gl: WebGLRenderingContext,
        private readonly program: WebGLProgram,
        private readonly textureUniform: WebGLUniformLocation,
        private readonly resolutionUniform: WebGLUniformLocation,
        private readonly opacityUniform: WebGLUniformLocation
    ) {
        this.buffer = gl.createBuffer()!
        this.array = new Float32Array(floatsPerVertex * 6 * this.capacity)
    }

    render(gl: WebGLRenderingContext, args: Args): void {
        if (args.framebuffer == null) {
            throw "Framebuffer should be defined"
        }
        const { sfact, dfact } = Blend.factorsNormal
        gl.blendFunc(sfact, dfact)
        gl.useProgram(this.program)
        gl.bindFramebuffer(gl.FRAMEBUFFER, args.framebuffer)
        if (this.capacity < args.blocks.length) {
            this.capacity = args.blocks.length
            this.array = new Float32Array(floatsPerVertex * 6 * this.capacity)
        }

        const array = this.array

        let offset = 0
        for (let i = 0; i < args.blocks.length; i++) {
            const { x0, y0, x1, y1 } = args.blocks[i]
            array[offset++] = x0
            array[offset++] = y0
            array[offset++] = x0
            array[offset++] = y1
            array[offset++] = x1
            array[offset++] = y0

            array[offset++] = x0
            array[offset++] = y1
            array[offset++] = x1
            array[offset++] = y0
            array[offset++] = x1
            array[offset++] = y1
        }

        // buffer data
        gl.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, this.buffer)
        gl.bufferData(WebGLRenderingContext.ARRAY_BUFFER, array, WebGLRenderingContext.DYNAMIC_DRAW)

        // update uniforms
        gl.uniform1i(this.textureUniform, args.textureIdx)
        gl.uniform2f(this.resolutionUniform, args.resolution.x, args.resolution.y)
        gl.uniform1f(this.opacityUniform, args.opacity)

        // enable attributes
        gl.vertexAttribPointer(0, 2, WebGLRenderingContext.FLOAT, false, batchStride, 0)

        gl.enableVertexAttribArray(0)

        gl.drawArrays(WebGLRenderingContext.TRIANGLES, 0, 6 * args.blocks.length)
    }

    dispose(gl: WebGLRenderingContext): void {
        gl.deleteBuffer(this.buffer)
        gl.deleteProgram(this.program)
    }
}
