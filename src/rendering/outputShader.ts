import { Blend, createProgram, getUniformLocation, DEFINE_from_linear } from "../web-gl"
import { Vec2 } from "../util"

const floatsPerVertex = 4
const batchStride = floatsPerVertex * 4

const VERT_SRC = `
precision highp float;

attribute vec2 a_tex_coords;
attribute vec2 a_position;

uniform vec2 u_resolution;

varying vec2 v_tex_coords;

void main() {
    vec2 pos = (a_position / u_resolution) * vec2(2.0) - vec2(1.0);
    gl_Position = vec4(pos, 0.0, 1.0);
    
    v_tex_coords = a_tex_coords;
}
`

const FRAG_SRC = `
precision highp float;

${DEFINE_from_linear}

varying vec2 v_tex_coords;

uniform sampler2D u_texture;

void main() {
    vec4 pixel = texture2D(u_texture, v_tex_coords);
    gl_FragColor = vec4(from_linear(pixel.rgb), pixel.a);
    //gl_FragColor = vec4(0.0, 0.0, 0.0, pixel.a);
}
`

export interface Args {
    readonly resolution: Vec2
    readonly textureIdx: number
    readonly x0: number
    readonly y0: number
    readonly x1: number
    readonly y1: number
}

export class Shader {
    static create(gl: WebGLRenderingContext): Shader | null {
        const program = createProgram(gl, VERT_SRC, FRAG_SRC)
        if (program === null) return null

        gl.bindAttribLocation(program, 0, "a_tex_coords")
        gl.bindAttribLocation(program, 1, "a_position")

        const textureUniform = getUniformLocation(gl, program, "u_texture")
        if (textureUniform === null) return null

        const resolutionUniform = getUniformLocation(gl, program, "u_resolution")
        if (resolutionUniform === null) return null

        return new Shader(gl, program, textureUniform, resolutionUniform)
    }

    private readonly buffer: WebGLBuffer
    private readonly array: Float32Array

    private constructor(
        gl: WebGLRenderingContext,
        private readonly program: WebGLProgram,
        private readonly textureUniform: WebGLUniformLocation,
        private readonly resolutionUniform: WebGLUniformLocation
    ) {
        this.buffer = gl.createBuffer()!
        this.array = new Float32Array(floatsPerVertex * 6)
        const array = this.array

        array[0] = 0
        array[1] = 0
        array[4] = 0
        array[5] = 1
        array[8] = 1
        array[9] = 0

        array[12] = 0
        array[13] = 1
        array[16] = 1
        array[17] = 0
        array[20] = 1
        array[21] = 1
    }

    render(gl: WebGLRenderingContext, args: Args): void {
        const { sfact, dfact } = Blend.factorsNormal
        gl.blendFunc(sfact, dfact)

        gl.useProgram(this.program)
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        const array = this.array
        const { x0, y0, x1, y1 } = args

        array[2] = x0
        array[3] = y0
        array[6] = x0
        array[7] = y1
        array[10] = x1
        array[11] = y0

        array[14] = x0
        array[15] = y1
        array[18] = x1
        array[19] = y0
        array[22] = x1
        array[23] = y1

        // buffer data
        gl.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, this.buffer)
        gl.bufferData(WebGLRenderingContext.ARRAY_BUFFER, array, WebGLRenderingContext.DYNAMIC_DRAW)

        // update uniforms
        gl.uniform1i(this.textureUniform, args.textureIdx)
        gl.uniform2f(this.resolutionUniform, args.resolution.x, args.resolution.y)

        // enable attributes
        gl.vertexAttribPointer(0, 2, WebGLRenderingContext.FLOAT, false, batchStride, 0)
        gl.vertexAttribPointer(1, 2, WebGLRenderingContext.FLOAT, false, batchStride, 8)

        gl.enableVertexAttribArray(0)
        gl.enableVertexAttribArray(1)

        gl.drawArrays(WebGLRenderingContext.TRIANGLES, 0, 6)
    }

    dispose(gl: WebGLRenderingContext): void {
        gl.deleteBuffer(this.buffer)
        gl.deleteProgram(this.program)
    }
}
