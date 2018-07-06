import { Hsv } from "../../../data"
import { createProgram, DEFINE_hsv2rgb } from "../../../web-gl"

const WI = 0.55

const SATVAL_VERT_SRC = `
precision highp float;

attribute vec2 a_position;

varying vec2 v_tex_position;

void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);

    v_tex_position = ((a_position / ${WI.toFixed(2)}) + 1.0) / 2.0;
}
`

const SATVAL_FRAG_SRC = `
precision highp float;

${DEFINE_hsv2rgb}

varying vec2 v_tex_position;

uniform float u_hue;

void main() {
    // mix saturation from left to right [0, 1]
    // mix value from bottom to top: [0, 1]
    float s = v_tex_position.x;
    float v = v_tex_position.y;
    vec3 color = hsv2rgb(vec3(u_hue, s, v));

    gl_FragColor = vec4(color, 1.0);
}
`

export class SatValRenderer {
    private readonly program: WebGLProgram
    private readonly buffer: WebGLBuffer
    private readonly colorLocation: WebGLUniformLocation

    constructor(private readonly gl: WebGLRenderingContext) {
        this.program = createProgram(gl, SATVAL_VERT_SRC, SATVAL_FRAG_SRC)!
        this.buffer = gl.createBuffer()!
        gl.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, this.buffer)
        gl.bufferData(
            WebGLRenderingContext.ARRAY_BUFFER,
            new Float32Array([
                // 1
                WI,
                WI,
                // 2
                -WI,
                WI,
                // 3
                WI,
                -WI,
                // 4
                -WI,
                WI,
                // 5
                WI,
                -WI,
                // 6
                -WI,
                -WI,
            ]),
            WebGLRenderingContext.STATIC_DRAW
        )
        gl.bindAttribLocation(this.program, 0, "a_position")

        this.colorLocation = gl.getUniformLocation(this.program, "u_hue")!
    }

    render(color: Hsv): void {
        const gl = this.gl

        gl.useProgram(this.program)
        gl.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, this.buffer)

        gl.vertexAttribPointer(0, 2, WebGLRenderingContext.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(0)

        gl.uniform1f(this.colorLocation, color.h)

        gl.drawArrays(WebGLRenderingContext.TRIANGLES, 0, 6)
    }

    dispose(): void {
        const gl = this.gl
        gl.deleteBuffer(this.buffer)
        gl.deleteProgram(this.program)
    }
}
