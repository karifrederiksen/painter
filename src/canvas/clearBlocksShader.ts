import { Blend, createProgram, getUniformLocation } from "../webgl"
import { Vec2 } from "../util"
import { RgbLinear } from "color"

const floatsPerVertex = 2
const batchStride = floatsPerVertex * 4

const VERT_SRC = `
precision highp float;

attribute vec2 a_position;

uniform vec2 u_resolution;

void main() {
    vec2 pos = a_position / u_resolution;
    pos.y = 1.0 - pos.y;
    pos = pos * 2.0;
    pos = pos - 1.0;
    gl_Position = vec4(pos, 0.0, 1.0);
}
`

const FRAG_SRC = `
precision highp float;

uniform vec4 u_rgba;

void main() {
    gl_FragColor = u_rgba;
}
`

export interface Args {
    readonly resolution: Vec2
    readonly framebuffer: WebGLFramebuffer
    readonly color: RgbLinear
    readonly alpha: number
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

        const resolutionUniform = getUniformLocation(gl, program, "u_resolution")
        if (resolutionUniform === null) return null

        const rgbaUniform = getUniformLocation(gl, program, "u_rgba")
        if (rgbaUniform === null) return null

        return new Shader(gl, program, resolutionUniform, rgbaUniform)
    }

    private readonly buffer: WebGLBuffer
    private array: Float32Array
    private capacity = 1024

    private constructor(
        gl: WebGLRenderingContext,
        private readonly program: WebGLProgram,
        private readonly resolutionUniform: WebGLUniformLocation,
        private readonly rgbaUniform: WebGLUniformLocation
    ) {
        this.buffer = gl.createBuffer() as WebGLBuffer
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
        gl.uniform2f(this.resolutionUniform, args.resolution.x, args.resolution.y)
        const { alpha, color } = args
        gl.uniform4f(this.rgbaUniform, color.r * alpha, color.g * alpha, color.b * alpha, alpha)

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
