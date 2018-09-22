import * as React from "react"
import styled from "../styled"
import { DEFINE_TAU, DEFINE_hsv2rgb, createProgram } from "canvas/web-gl"
import { Hsv } from "canvas/color"

export type ColorWheelProps = {
    readonly color: Hsv
    readonly onChange: (color: Hsv) => void
}

const Container = styled.div`
    display: flex;
    justify-content: center;
    width: 100%;
`

const enum PointerState {
    Default,
    DownOnInner,
    DownOnOuter,
}

const MARGIN = (1 - 0.55) / 2
type WithClientXY = Readonly<{
    clientX: number
    clientY: number
}>

/* tslint:disable-next-line */
const noOp = () => {}

export class ColorWheel extends React.Component<ColorWheelProps> {
    private container: HTMLDivElement | null = null
    private pointerState: PointerState = PointerState.Default
    private gl: WebGLRenderingContext | null = null
    private ringRenderer: RingRenderer | null = null
    private satValRenderer: SatValRenderer | null = null

    render(): JSX.Element {
        return (
            <Container>
                <div onMouseDown={this.onDown} ref={el => (this.container = el)}>
                    <canvas width="160" height="160" ref={this.initialize} />
                </div>
            </Container>
        )
    }

    componentDidUpdate() {
        this.renderGL()
    }

    componentDidMount(): void {
        this.renderGL()
        document.body.addEventListener("mousemove", this.onMove, { passive: true })
        document.body.addEventListener("mouseup", this.onUp, { passive: true })
    }

    componentWillUnmount(): void {
        document.body.removeEventListener("mousemove", this.onMove)
        document.body.removeEventListener("mouseup", this.onUp)
        if (this.ringRenderer !== null) this.ringRenderer.dispose()
        if (this.satValRenderer !== null) this.satValRenderer.dispose()
    }

    shouldComponentUpdate(prevProps: ColorWheelProps) {
        return !this.props.color.eq(prevProps.color)
    }

    private initialize = (canvas: HTMLCanvasElement | null): void => {
        if (canvas === null) return

        const gl = canvas.getContext("webgl")
        if (gl === null) throw "Failed to init webgl"

        this.gl = gl
        this.ringRenderer = new RingRenderer(gl)
        this.satValRenderer = new SatValRenderer(gl)
    }

    private renderGL() {
        this.gl!.clearColor(0, 0, 0, 0)
        this.gl!.clear(WebGLRenderingContext.COLOR_BUFFER_BIT)
        this.ringRenderer!.render()
        this.satValRenderer!.render(this.props.color)
    }

    private onDown = (ev: WithClientXY): void => {
        const bounds = this.container!.getBoundingClientRect()
        const x = clamp(ev.clientX - bounds.left, 0, bounds.width)
        const y = clamp(ev.clientY - bounds.top, 0, bounds.height)

        const marginX = bounds.width * MARGIN
        const marginY = bounds.height * MARGIN

        const isInner =
            isInclusive(x, marginX, bounds.width - marginX) &&
            isInclusive(y, marginY, bounds.height - marginY)

        if (isInner) {
            this.pointerState = PointerState.DownOnInner
            this.signalInner(ev)
        } else {
            this.pointerState = PointerState.DownOnOuter
            this.signalOuter(ev)
        }
    }

    private onUp = (_ev: WithClientXY): void => {
        this.pointerState = PointerState.Default
    }

    private onMove = (ev: WithClientXY): void => {
        switch (this.pointerState) {
            case PointerState.Default:
                break
            case PointerState.DownOnInner:
                this.signalInner(ev)
                break
            case PointerState.DownOnOuter:
                this.signalOuter(ev)
                break
        }
    }

    private signalOuter(ev: WithClientXY) {
        // get xy delta from the center of the ring
        const bounds = this.container!.getBoundingClientRect()
        const x = ev.clientX - bounds.left - bounds.width * 0.5
        const y = ev.clientY - bounds.top - bounds.height * 0.5

        // calculate radians of the delta
        const rad = Math.atan2(y, x)

        // get hue from radians (keep in mind the ring is turned 50%)
        const hue = rad / (Math.PI * 2) + 0.5

        const prevColor = this.props.color
        const color = new Hsv(hue, prevColor.s, prevColor.v)
        this.props.onChange(color)
    }

    private signalInner(ev: WithClientXY): void {
        const bounds = this.container!.getBoundingClientRect()
        const marginX = bounds.width * MARGIN
        const marginY = bounds.height * MARGIN

        const width = bounds.width - marginX * 2
        const height = bounds.height - marginY * 2

        const x = clamp(ev.clientX - bounds.left - marginX, 0, width)
        const y = clamp(ev.clientY - bounds.top - marginY, 0, height)

        const pctX = x / width
        const pctY = 1 - y / height

        const color = new Hsv(this.props.color.h, pctX, pctY)
        this.props.onChange(color)
    }
}

function clamp(x: number, min: number, max: number): number {
    return x < min ? min : x > max ? max : x
}

function isInclusive(n: number, min: number, max: number): boolean {
    return n >= min && n <= max
}

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
            new Float32Array([1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0]),
            WebGLRenderingContext.STATIC_DRAW
        )
        gl.bindAttribLocation(this.program, 0, "a_position")
    }

    render(): void {
        const gl = this.gl
        gl.useProgram(this.program)
        gl.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, this.buffer)

        gl.vertexAttribPointer(0, 2, WebGLRenderingContext.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(0)

        gl.drawArrays(WebGLRenderingContext.TRIANGLE_STRIP, 0, 4)
    }

    dispose(): void {
        const gl = this.gl
        gl.deleteBuffer(this.buffer)
        gl.deleteProgram(this.program)
    }
}

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
