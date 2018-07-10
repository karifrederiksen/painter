import { DEFINE_TAU, DEFINE_hsv2rgb, createProgram } from "core/web-gl"

const RING_VERT_SRC = `
precision highp float;

attribute vec2 a_position;

varying vec2 v_position;

void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);

    v_position = a_position;
}
`

const RING_FRAG_SRC = `
precision highp float;

varying vec2 v_position;

${DEFINE_TAU}

${DEFINE_hsv2rgb}

#define INNER_RAD1 0.83
#define INNER_RAD2 0.85
#define OUTER_RAD1 0.98
#define OUTER_RAD2 1.00

void main() {
    vec2 pos = v_position * vec2(1.0, -1.0);
    float dist = sqrt(dot(pos, pos));

    float a = smoothstep(INNER_RAD1, INNER_RAD2, dist) - smoothstep(OUTER_RAD1, OUTER_RAD2, dist);

    float radians = atan(pos.y, pos.x);
    float hue = (radians / TAU) + 0.5;

    vec3 hsv = vec3(hue, 1.0, a);

    gl_FragColor = vec4(hsv2rgb(hsv), a);
}
`

export class RingRenderer {
    private readonly program: WebGLProgram
    private readonly buffer: WebGLBuffer

    constructor(private readonly gl: WebGLRenderingContext) {
        this.program = createProgram(gl, RING_VERT_SRC, RING_FRAG_SRC)!
        this.buffer = gl.createBuffer()!
        gl.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, this.buffer)
        gl.bufferData(
            WebGLRenderingContext.ARRAY_BUFFER,
            new Uint8Array([1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0]),
            WebGLRenderingContext.STATIC_DRAW
        )
        gl.bindAttribLocation(this.program, 0, "a_position")
    }

    render(): void {
        const gl = this.gl
        gl.useProgram(this.program)
        gl.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, this.buffer)

        gl.vertexAttribPointer(0, 2, WebGLRenderingContext.BYTE, false, 0, 0)
        gl.enableVertexAttribArray(0)

        gl.drawArrays(WebGLRenderingContext.TRIANGLE_STRIP, 0, 4)
    }

    dispose(): void {
        const gl = this.gl
        gl.deleteBuffer(this.buffer)
        gl.deleteProgram(this.program)
    }
}
