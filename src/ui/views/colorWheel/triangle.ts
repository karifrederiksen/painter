import { Hsv } from "core"
import { createProgram, DEFINE_hsv2rgb } from "core/web-gl"

const SATVAL_VERT_SRC = `
precision highp float;

${DEFINE_hsv2rgb}

attribute vec2 a_position;
attribute vec3 a_color;

varying vec3 v_color;

void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);

    v_color = hsv2rgb(a_color);
}
`

const SATVAL_FRAG_SRC = `
precision highp float;

varying vec3 v_color;

void main() {
    gl_FragColor = vec4(v_color, 1.0);
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

        // color 1 - No saturation
        arr[2] = color.h
        arr[3] = 0
        arr[4] = 1

        // color 2 - Full saturation
        arr[7] = color.h
        arr[8] = 1
        arr[9] = 1

        // color 3 - Black
        arr[12] = color.h
        arr[13] = 1
        arr[14] = 0

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
