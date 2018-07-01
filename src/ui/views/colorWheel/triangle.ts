import { Hsv } from "../../../data"
import { createProgram, DEFINE_from_linear } from "../../../web-gl"

const SATVAL_VERT_SRC = `
precision highp float;

attribute vec2 a_position;
attribute vec3 a_color;

varying vec3 v_color;

void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);

    v_color = a_color;
}
`

const SATVAL_FRAG_SRC = `
precision highp float;

varying vec3 v_color;

${DEFINE_from_linear}

void main() {
    gl_FragColor = vec4(from_linear(v_color), 1.0);
}
`

export class TriangleRenderer {
    private readonly program: WebGLProgram
    private readonly buffer: WebGLBuffer
    private readonly array: Float32Array

    constructor(private readonly gl: WebGLRenderingContext) {
        this.program = createProgram(gl, SATVAL_VERT_SRC, SATVAL_FRAG_SRC)!
        this.buffer = gl.createBuffer()!
        this.array = new Float32Array([
            // pos 1
            -0.7,
            -0.4,
            0.0,
            0.0,
            0.0,
            // pos 2
            0.7,
            -0.4,
            0.0,
            0.0,
            0.0,
            // pos 3
            0.0,
            0.8,
            0.0,
            0.0,
            0.0,
        ])
        gl.bindAttribLocation(this.program, 0, "a_position")
        gl.bindAttribLocation(this.program, 1, "a_color")
    }

    render(color: Hsv): void {
        const gl = this.gl
        const arr = this.array

        const fullSat = Hsv.make(color.h, 1.0, 1.0).toRgb()
        const fullVal = Hsv.make(color.h, 0.0, 1.0).toRgb()
        const black = Hsv.make(color.h, 0.0, 0.0).toRgb()

        // color 1
        arr[2] = fullSat.r
        arr[3] = fullSat.g
        arr[4] = fullSat.b

        // color 2
        arr[7] = fullVal.r
        arr[8] = fullVal.g
        arr[9] = fullVal.b

        // color 3
        arr[12] = black.r
        arr[13] = black.g
        arr[14] = black.b

        gl.useProgram(this.program)
        gl.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, this.buffer)
        gl.bufferData(
            WebGLRenderingContext.ARRAY_BUFFER,
            this.array,
            WebGLRenderingContext.STATIC_DRAW
        )

        gl.vertexAttribPointer(0, 2, WebGLRenderingContext.FLOAT, false, 20, 0)
        gl.vertexAttribPointer(1, 3, WebGLRenderingContext.FLOAT, false, 20, 8)
        gl.enableVertexAttribArray(0)
        gl.enableVertexAttribArray(1)

        gl.drawArrays(WebGLRenderingContext.TRIANGLES, 0, 3)
    }

    dispose(): void {
        const gl = this.gl
        gl.deleteBuffer(this.buffer)
        gl.deleteProgram(this.program)
    }
}
