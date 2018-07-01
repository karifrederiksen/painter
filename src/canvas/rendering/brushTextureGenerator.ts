import { Renderer } from "./renderer"
import { Texture } from "./texture"
import { Rgb, Vec4 } from "../../data"
import { getUniformLocation, createProgram } from "../../web-gl"

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
uniform float u_gamma;

void main() {
  float radius = 1.0 - u_softness;
  float dist = sqrt(dot(v_position, v_position));
  float a = 1.0 - smoothstep(radius, radius + u_softness, dist);

  gl_FragColor = vec4(vec3(0.0), pow(a, u_gamma));
}
`

export interface BrushTextureArgs {
    readonly softness: number
    readonly gamma: number
}

export class BrushTextureGenerator {
    static create(gl: WebGLRenderingContext): BrushTextureGenerator | null {
        const program = createProgram(gl, VERT_SRC, FRAG_SRC)
        if (program === null) return null

        gl.useProgram(program)
        gl.bindAttribLocation(program, 0, "a_position")

        const softnessUniform = getUniformLocation(gl, program, "u_softness")
        if (softnessUniform === null) return null

        const gammaUniform = getUniformLocation(gl, program, "u_gamma")
        if (gammaUniform === null) return null

        return new BrushTextureGenerator(gl, program, softnessUniform, gammaUniform)
    }

    private readonly buffer: WebGLBuffer
    private readonly array: Float32Array

    private constructor(
        gl: WebGLRenderingContext,
        readonly program: WebGLProgram,
        private readonly softnessUniform: WebGLUniformLocation,
        private readonly gammaUniform: WebGLUniformLocation
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

    generateBrushTexture(renderer: Renderer, args: BrushTextureArgs, texture: Texture): void {
        renderer.setViewport(new Vec4(0, 0, texture.size.x, texture.size.y))
        renderer.setFramebuffer(texture.framebuffer)
        renderer.setClearColor(Rgb.Black, 0)
        renderer.clear()
        renderer.setProgram(this.program)

        renderer.gl.uniform1f(this.softnessUniform, args.softness)
        renderer.gl.uniform1f(this.gammaUniform, args.gamma)

        renderer.gl.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, this.buffer)
        renderer.gl.bufferData(
            WebGLRenderingContext.ARRAY_BUFFER,
            this.array,
            WebGLRenderingContext.STATIC_DRAW
        )

        renderer.gl.vertexAttribPointer(0, 2, WebGLRenderingContext.FLOAT, false, 8, 0)
        renderer.gl.enableVertexAttribArray(0)

        renderer.gl.drawArrays(WebGLRenderingContext.TRIANGLES, 0, 6)
    }

    dispose(gl: WebGLRenderingContext): void {
        gl.deleteBuffer(this.buffer)
        gl.deleteProgram(this.program)
    }
}
