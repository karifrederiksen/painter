import * as React from "react"
import styled from "../styled"
import { DEFINE_TAU, createProgram, DEFINE_hsluv_etc, DEFINE_hsvToRgb } from "../web-gl"
import * as Color from "../color"
import { ColorType } from "../tools/brushTool"

export type ColorWheelProps = {
    readonly color: Color.Hsluv
    readonly colorType: ColorType
    readonly onChange: (color: Color.Hsluv) => void
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
        this.ringRenderer!.render(this.props.colorType, this.props.color)
        this.satValRenderer!.render(this.props.colorType, this.props.color)
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
        this.props.onChange(prevColor.withH(hue * 360))
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

        const hue = this.props.color.h

        switch (this.props.colorType) {
            case ColorType.Hsv:
                this.props.onChange(
                    Color.rgbToHsluv(Color.hsvToRgb(new Color.Hsv(hue, pctX, pctY)))
                )
                break
            case ColorType.Hsluv:
                this.props.onChange(new Color.Hsluv(hue, pctX * 100, pctY * 100))
                break
            case ColorType.Hpluv:
                this.props.onChange(
                    Color.lchToHsluv(Color.hpluvToLch(new Color.Hpluv(hue, pctX * 100, pctY * 100)))
                )
                break
        }
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

function makeRingFragSrc(DEFINE_toRgb: string) {
    return `
    precision highp float;
    
    ${DEFINE_TAU}

    ${DEFINE_toRgb}
    
    #define INNER_RAD1 0.83
    #define INNER_RAD2 0.85
    #define OUTER_RAD1 0.98
    #define OUTER_RAD2 1.00
    
    varying vec2 v_position;
    
    uniform vec3 u_color;
    
    void main() {
        vec2 pos = v_position * vec2(1.0, -1.0);
        float dist = sqrt(dot(pos, pos));
    
        float a = smoothstep(INNER_RAD1, INNER_RAD2, dist) - smoothstep(OUTER_RAD1, OUTER_RAD2, dist);
    
        float radians = atan(pos.y, pos.x);
        float hue = (radians / TAU) + 0.5;
    
        vec3 hsluv = vec3(hue, 1.0, a);
    
        gl_FragColor = vec4(toRgb(u_color, hsluv) * a, a);
    }
    `
}

const RING_FRAG_SRC_HSV = makeRingFragSrc(`
${DEFINE_hsvToRgb}

vec3 toRgb(vec3 color, vec3 xyz) {
    return hsvToRgb(xyz);
}
`)

const RING_FRAG_SRC_HSLUV = makeRingFragSrc(`
${DEFINE_hsluv_etc}

vec3 toRgb(vec3 color, vec3 xyz) {
    return hsluvToRgb(xyz * vec3(360.0, color.y, color.z));
}
`)

export class RingRenderer {
    private readonly buffer: WebGLBuffer
    private program: WebGLProgram | null = null
    private colorLocation: WebGLUniformLocation | null = null
    private prevColorType: ColorType | null = null
    private prevColor: Color.Hsluv | null = null

    constructor(private readonly gl: WebGLRenderingContext) {
        this.buffer = gl.createBuffer()!
        gl.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, this.buffer)
        gl.bufferData(
            WebGLRenderingContext.ARRAY_BUFFER,
            new Float32Array([1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0]),
            WebGLRenderingContext.STATIC_DRAW
        )
    }

    render(colorType: ColorType, color: Color.Hsluv): void {
        const gl = this.gl

        if (!this.program || this.prevColorType !== colorType) {
            if (this.program) {
                gl.deleteProgram(this.program)
            }

            switch (colorType) {
                case ColorType.Hsv:
                    this.program = createProgram(gl, RING_VERT_SRC, RING_FRAG_SRC_HSV)!
                    break
                case ColorType.Hsluv:
                    this.program = createProgram(gl, RING_VERT_SRC, RING_FRAG_SRC_HSLUV)!
                    break
                case ColorType.Hpluv:
                    throw "todo"
            }
            gl.bindAttribLocation(this.program, 0, "a_position")
            this.colorLocation = gl.getUniformLocation(this.program, "u_color")!
            this.prevColorType = colorType
        }

        gl.useProgram(this.program)
        gl.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, this.buffer)

        gl.vertexAttribPointer(0, 2, WebGLRenderingContext.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(0)

        switch (colorType) {
            case ColorType.Hsv: {
                const hsv = Color.rgbToHsv(Color.hsluvToRgb(color))
                this.gl.uniform3f(this.colorLocation, hsv.h, hsv.s, hsv.v)
                break
            }
            case ColorType.Hsluv: {
                this.gl.uniform3f(this.colorLocation, color.h, color.s, color.l)
                break
            }
            case ColorType.Hpluv: {
                const hpluv = Color.lchToHsluv(Color.hsluvToLch(color))
                this.gl.uniform3f(this.colorLocation, hpluv.h, hpluv.s, hpluv.l)
                break
            }
        }
        this.prevColor = color

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

function makeSatValFragSrc(DEFINE_toRgb: string): string {
    return `
    precision highp float;

    ${DEFINE_toRgb}
    
    varying vec2 v_tex_position;
    
    uniform vec3 u_color;
    
    void main() {
        // mix saturation from left to right [0, 1]
        // mix value from bottom to top: [0, 1]
        float x = v_tex_position.x;
        float y = v_tex_position.y;
    
        gl_FragColor = vec4(
            toRgb(u_color.x, x, y),
            1.0
        );
    }
    `
}

const SATVAL_FRAG_SRC_HSV = makeSatValFragSrc(`
${DEFINE_hsvToRgb}

vec3 toRgb(float hue, float x, float y) {
    return hsvToRgb(vec3(hue, x, y));
}
`)

const SATVAL_FRAG_SRC_HSLUV = makeSatValFragSrc(`
${DEFINE_hsluv_etc}

vec3 toRgb(float hue, float x, float y) {
    return hsluvToRgb(vec3(hue, x * 100.0, y * 100.0));
}
`)

export class SatValRenderer {
    private readonly buffer: WebGLBuffer
    private colorLocation: WebGLUniformLocation | null = null
    private program: WebGLProgram | null = null
    private prevColorType: ColorType | null = null
    private prevColor: Color.Hsluv | null = null

    constructor(private readonly gl: WebGLRenderingContext) {
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
    }

    render(colorType: ColorType, color: Color.Hsluv): void {
        const gl = this.gl

        if (!this.program || this.prevColor!.eq(color)) {
            if (this.program) {
                gl.deleteProgram(this.program)
            }

            switch (colorType) {
                case ColorType.Hsv:
                    this.program = createProgram(gl, SATVAL_VERT_SRC, SATVAL_FRAG_SRC_HSV)!
                    break
                case ColorType.Hsluv:
                    this.program = createProgram(gl, SATVAL_VERT_SRC, SATVAL_FRAG_SRC_HSLUV)!
                    break
                case ColorType.Hpluv:
                    throw "todo"
            }
            gl.bindAttribLocation(this.program, 0, "a_position")
            this.colorLocation = gl.getUniformLocation(this.program, "u_color")!
            this.prevColorType = colorType
        }

        gl.useProgram(this.program)
        gl.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, this.buffer)

        gl.vertexAttribPointer(0, 2, WebGLRenderingContext.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(0)

        switch (colorType) {
            case ColorType.Hsv: {
                const hsv = Color.rgbToHsv(Color.hsluvToRgb(color))
                this.gl.uniform3f(this.colorLocation, hsv.h, hsv.s, hsv.v)
                break
            }
            case ColorType.Hsluv: {
                this.gl.uniform3f(this.colorLocation, color.h, color.s, color.l)
                break
            }
            case ColorType.Hpluv: {
                const hsl = Color.lchToHsluv(Color.hsluvToLch(color))
                this.gl.uniform3f(this.colorLocation, hsl.h, hsl.s, hsl.l)
                break
            }
        }
        this.prevColor = color

        gl.drawArrays(WebGLRenderingContext.TRIANGLES, 0, 6)
    }

    dispose(): void {
        const gl = this.gl
        gl.deleteBuffer(this.buffer)
        gl.deleteProgram(this.program)
    }
}
