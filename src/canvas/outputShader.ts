import * as WebGL from "../webgl"
import { Vec2 } from "../util"

const VERT_SRC = `
precision highp float;

attribute vec2 a_position;

uniform vec2 u_resolution;

varying vec2 v_tex_coords;

void main() {
    vec2 pos = a_position / u_resolution;
    pos.y = 1.0 - pos.y;
    v_tex_coords = pos;
    pos = pos * 2.0;
    pos = pos - 1.0;
    gl_Position = vec4(pos, 0.0, 1.0);
    
}
`

const FRAG_SRC = `
precision highp float;

${WebGL.DEFINE_from_linear}

varying vec2 v_tex_coords;

uniform sampler2D u_texture;

void main() {
    vec4 pixel = texture2D(u_texture, v_tex_coords);
    gl_FragColor = vec4(from_linear(pixel.rgb), pixel.a);
}
`

const AttributesInfo = new WebGL.AttributesInfo([
    { name: "a_position", size: 2, type: WebGL.AttribType.Float },
])

export interface Args {
    readonly resolution: Vec2
    readonly textureIdx: number
    readonly blocks: ReadonlyArray<{
        readonly x0: number
        readonly y0: number
        readonly x1: number
        readonly y1: number
    }>
}

interface UniformLocations {
    readonly u_texture: WebGLUniformLocation
    readonly u_resolution: WebGLUniformLocation
}

export class Shader {
    static create(gl: WebGLRenderingContext): Shader | null {
        const program = WebGL.createProgram(gl, VERT_SRC, FRAG_SRC)
        if (program === null) {
            return null
        }

        const locations = WebGL.getUniformLocation(gl, program, {
            u_texture: true,
            u_resolution: true,
        })
        if (locations === null) {
            return null
        }

        AttributesInfo.bindAttribLocations(gl, program)

        return new Shader(gl, program, locations)
    }

    private readonly buffer: WebGLBuffer
    private array: Float32Array
    private capacity = 1024

    private constructor(
        gl: WebGLRenderingContext,
        private readonly program: WebGLProgram,
        private readonly locations: UniformLocations
    ) {
        this.buffer = gl.createBuffer()!
        this.array = new Float32Array(AttributesInfo.size * 6 * this.capacity)
    }

    render(gl: WebGLRenderingContext, args: Args): void {
        const { sfact, dfact } = WebGL.Blend.factorsNormal
        gl.blendFunc(sfact, dfact)

        gl.useProgram(this.program)
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        if (this.capacity < args.blocks.length) {
            this.capacity = args.blocks.length
            this.array = new Float32Array(AttributesInfo.size * 6 * this.capacity)
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
        gl.uniform1i(this.locations.u_texture, args.textureIdx)
        gl.uniform2f(this.locations.u_resolution, args.resolution.x, args.resolution.y)

        AttributesInfo.vertexAttrib(gl)

        gl.drawArrays(WebGLRenderingContext.TRIANGLES, 0, 6 * args.blocks.length)
    }

    dispose(gl: WebGLRenderingContext): void {
        gl.deleteBuffer(this.buffer)
        gl.deleteProgram(this.program)
    }
}
