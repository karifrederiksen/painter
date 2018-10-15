import { Blend, getUniformLocation, createProgram, DEFINE_to_linear } from "../webgl"
import { Vec2 } from "../util"

const VERT_SRC = `
precision highp float;

attribute vec2 a_position;

varying vec2 v_position;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  
  v_position = a_position;
}
`

const FRAG_SRC = `
precision highp float;

varying vec2 v_position;

uniform float u_softness;

void main() {
  float radius = 1.0 - u_softness;
  float dist = sqrt(dot(v_position, v_position));
  float a = 1.0 - smoothstep(radius, radius + u_softness, dist);

  gl_FragColor = vec4(vec3(0.0), (a));
}
`

export interface Args {
    readonly softness: number
    readonly framebuffer: WebGLFramebuffer
    readonly size: Vec2
}

export class Generator {
    static create(gl: WebGLRenderingContext): Generator | null {
        const program = createProgram(gl, VERT_SRC, FRAG_SRC)
        if (program === null) return null

        gl.useProgram(program)
        gl.bindAttribLocation(program, 0, "a_position")

        const softnessUniform = getUniformLocation(gl, program, "u_softness")
        if (softnessUniform === null) return null

        return new Generator(gl, program, softnessUniform)
    }

    private readonly buffer: WebGLBuffer
    private readonly array: Float32Array

    private constructor(
        gl: WebGLRenderingContext,
        readonly program: WebGLProgram,
        private readonly softnessUniform: WebGLUniformLocation
    ) {
        this.buffer = gl.createBuffer()!
        const array = new Float32Array(12)
        array[0] = -1
        array[1] = -1

        array[2] = -1
        array[3] = 1

        array[4] = 1
        array[5] = -1

        array[6] = -1
        array[7] = 1

        array[8] = 1
        array[9] = -1

        array[10] = 1
        array[11] = 1
        this.array = array
    }

    generateBrushTexture(gl: WebGLRenderingContext, args: Args): void {
        const { sfact, dfact } = Blend.factorsNormal
        gl.blendFunc(sfact, dfact)
        gl.useProgram(this.program)
        gl.viewport(0, 0, args.size.x, args.size.y)
        gl.bindFramebuffer(gl.FRAMEBUFFER, args.framebuffer)
        gl.clearColor(0, 0, 0, 0)
        gl.clear(gl.COLOR_BUFFER_BIT)

        gl.uniform1f(this.softnessUniform, Math.max(args.softness, 0.000001))

        gl.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, this.buffer)
        gl.bufferData(
            WebGLRenderingContext.ARRAY_BUFFER,
            this.array,
            WebGLRenderingContext.STATIC_DRAW
        )

        gl.vertexAttribPointer(0, 2, WebGLRenderingContext.FLOAT, false, 8, 0)
        gl.enableVertexAttribArray(0)
        gl.drawArrays(WebGLRenderingContext.TRIANGLES, 0, 6)
    }

    dispose(gl: WebGLRenderingContext): void {
        gl.deleteBuffer(this.buffer)
        gl.deleteProgram(this.program)
    }
}
