import * as React from "react"
import * as Color from "color"
import { DEFINE_TAU, createProgram, DEFINE_hsluv_etc, DEFINE_hsvToRgb } from "../webgl"
import { ColorMode } from "../util"
import * as styles from "./colorWheel.scss"

export interface ColorWheelProps {
    readonly color: Color.Hsluv
    readonly colorType: ColorMode
    readonly onChange: (color: Color.Hsluv) => void
}

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

interface GlState {
    readonly gl: WebGLRenderingContext
    readonly ringRenderer: RingRenderer
    readonly satValRenderer: SatValRenderer
}

export function ColorWheel(props: ColorWheelProps): JSX.Element {
    const container = React.useRef<HTMLDivElement | null>(null)
    const canvas = React.useRef<HTMLCanvasElement | null>(null)
    const [glState, setGlState] = React.useState<GlState | null>(null)
    const pointerState = React.useRef(PointerState.Default)

    function signalOuter(ev: WithClientXY) {
        // get xy delta from the center of the ring
        const bounds = container.current!.getBoundingClientRect()
        const x = ev.clientX - bounds.left - bounds.width * 0.5
        const y = ev.clientY - bounds.top - bounds.height * 0.5

        // calculate radians of the delta
        const rad = Math.atan2(y, x)

        // get hue from radians (keep in mind the ring is turned 50%)
        const hue = rad / (Math.PI * 2) + 0.5

        const prevColor = props.color
        switch (props.colorType) {
            case ColorMode.Hsv: {
                const hsv = Color.rgbToHsv(props.color.toRgb())
                props.onChange(Color.rgbToHsluv(hsv.with({ h: hue }).toRgb()))
                break
            }
            case ColorMode.Hsluv: {
                props.onChange(prevColor.with({ h: hue * 360 }))
                break
            }
        }
    }

    function signalInner(ev: WithClientXY) {
        const bounds = container.current!.getBoundingClientRect()
        const marginX = bounds.width * MARGIN
        const marginY = bounds.height * MARGIN

        const width = bounds.width - marginX * 2
        const height = bounds.height - marginY * 2

        const x = clamp(ev.clientX - bounds.left - marginX, 0, width)
        const y = clamp(ev.clientY - bounds.top - marginY, 0, height)

        const pctX = x / width
        const pctY = 1 - y / height

        switch (props.colorType) {
            case ColorMode.Hsv: {
                const hue = Color.rgbToHsv(props.color.toRgb()).h
                props.onChange(Color.rgbToHsluv(Color.hsvToRgb(new Color.Hsv(hue, pctX, pctY))))
                break
            }
            case ColorMode.Hsluv: {
                const hue = props.color.h
                props.onChange(new Color.Hsluv(hue, pctX * 100, pctY * 100))
                break
            }
        }
    }

    function onDown(ev: WithClientXY) {
        const bounds = container.current!.getBoundingClientRect()
        const x = clamp(ev.clientX - bounds.left, 0, bounds.width)
        const y = clamp(ev.clientY - bounds.top, 0, bounds.height)

        const marginX = bounds.width * MARGIN
        const marginY = bounds.height * MARGIN

        const isInner =
            isInclusive(x, marginX, bounds.width - marginX) &&
            isInclusive(y, marginY, bounds.height - marginY)

        if (isInner) {
            pointerState.current = PointerState.DownOnInner
            signalInner(ev)
        } else {
            pointerState.current = PointerState.DownOnOuter
            signalOuter(ev)
        }
    }

    function onUp(_ev: WithClientXY) {
        pointerState.current = PointerState.Default
    }

    function onMove(ev: WithClientXY) {
        switch (pointerState.current) {
            case PointerState.Default:
                break
            case PointerState.DownOnInner:
                signalInner(ev)
                break
            case PointerState.DownOnOuter:
                signalOuter(ev)
                break
        }
    }

    React.useEffect(() => {
        if (canvas.current === null) {
            return
        }

        const gl = canvas.current.getContext("webgl")
        if (gl === null) throw "Failed to init webgl"

        gl.blendFunc(WebGLRenderingContext.ONE, WebGLRenderingContext.ONE_MINUS_SRC_ALPHA)
        gl.enable(WebGLRenderingContext.BLEND)
        gl.disable(WebGLRenderingContext.DEPTH_TEST)

        const glState: GlState = {
            gl,
            ringRenderer: new RingRenderer(gl),
            satValRenderer: new SatValRenderer(gl),
        }

        setGlState(glState)

        return () => {
            glState.ringRenderer.dispose()
            glState.satValRenderer.dispose()
        }
    }, [canvas.current])

    React.useEffect(() => {
        if (glState === null) {
            return
        }
        // render
        glState.gl.clearColor(0, 0, 0, 0)
        glState.gl.clear(WebGLRenderingContext.COLOR_BUFFER_BIT)
        glState.ringRenderer.render(props.colorType, props.color)
        glState.satValRenderer.render(props.colorType, props.color)
    }, [glState, props.color, props.colorType])

    React.useEffect(() => {
        document.body.addEventListener("mousemove", onMove, { passive: true })
        return () => {
            document.body.removeEventListener("mousemove", onMove)
        }
    }, [props.color, props.colorType, props.onChange])

    React.useEffect(() => {
        document.body.addEventListener("mouseup", onUp)
        return () => {
            document.body.removeEventListener("mouseup", onUp)
        }
    }, [])

    const canvasRect = canvas.current !== null ? canvas.current.getBoundingClientRect() : null

    let angle: number
    let xPct: number
    let yPct: number
    if (props.colorType === ColorMode.Hsluv) {
        angle = (props.color.h + 180) % 360
        xPct = props.color.s / 100
        yPct = props.color.l / 100
    } else {
        const hsv = Color.rgbToHsv(props.color.toRgb())
        angle = (hsv.h * 360 + 180) % 360
        xPct = hsv.s
        yPct = hsv.v
    }

    let circleThumbX = 0
    let circleThumbY = 0
    if (canvasRect !== null) {
        const radius = 80
        const cx = canvasRect.left + radius
        const cy = canvasRect.top + radius

        const theta = (angle * Math.PI) / 180
        const dx = (radius - 8) * Math.cos(theta)
        const dy = (radius - 8) * Math.sin(theta)

        circleThumbX = cx + dx
        circleThumbY = cy + dy
    }

    let areaThumbX = 0
    let areaThumbY = 0
    if (canvasRect !== null) {
        const offset = canvasRect.width * 0.225
        const width = canvasRect.width * 0.55

        areaThumbX = canvasRect.left + offset + width * xPct
        areaThumbY = canvasRect.top + offset + width * (1 - yPct)
    }

    return (
        <div className={styles.container} onMouseDown={onDown} ref={container}>
            <canvas width="160" height="160" ref={canvas} />
            <div
                className={styles.cicleThumb}
                style={{
                    left: circleThumbX,
                    top: circleThumbY,
                    backgroundColor: props.color.toStyle(),
                    borderColor: props.color.l > 50 ? "black" : "white",
                    transform: "rotate(" + angle + "deg)",
                }}
            />
            <div
                className={styles.areaThumb}
                style={{
                    left: areaThumbX,
                    top: areaThumbY,
                    backgroundColor: props.color.toStyle(),
                    borderColor: props.color.l > 50 ? "black" : "white",
                }}
            />
        </div>
    )
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
    return hsvToRgb(xyz * vec3(1.0, color.y, color.z));
}
`)

const RING_FRAG_SRC_HSLUV = makeRingFragSrc(`
${DEFINE_hsluv_etc}

vec3 toRgb(vec3 color, vec3 xyz) {
    return hsluvToRgb(xyz * vec3(360.0, color.y, color.z));
}
`)

class RingRenderer {
    private readonly buffer: WebGLBuffer
    private program: WebGLProgram | null = null
    private colorLocation: WebGLUniformLocation | null = null
    private prevColorType: ColorMode | null = null

    constructor(private readonly gl: WebGLRenderingContext) {
        this.buffer = gl.createBuffer()!
        gl.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, this.buffer)
        gl.bufferData(
            WebGLRenderingContext.ARRAY_BUFFER,
            new Float32Array([1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0]),
            WebGLRenderingContext.STATIC_DRAW
        )
    }

    render(colorType: ColorMode, color: Color.Hsluv): void {
        if (!this.program || this.prevColorType !== colorType) {
            if (this.program) {
                this.gl.deleteProgram(this.program)
            }

            switch (colorType) {
                case ColorMode.Hsv:
                    this.program = createProgram(this.gl, RING_VERT_SRC, RING_FRAG_SRC_HSV)!
                    break
                case ColorMode.Hsluv:
                    this.program = createProgram(this.gl, RING_VERT_SRC, RING_FRAG_SRC_HSLUV)!
                    break
            }
            this.gl.bindAttribLocation(this.program!, 0, "a_position")
            this.colorLocation = this.gl.getUniformLocation(this.program!, "u_color")!
            this.prevColorType = colorType
        }

        this.gl.useProgram(this.program)
        this.gl.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, this.buffer)

        this.gl.vertexAttribPointer(0, 2, WebGLRenderingContext.FLOAT, false, 0, 0)
        this.gl.enableVertexAttribArray(0)

        switch (colorType) {
            case ColorMode.Hsv: {
                const hsv = Color.rgbToHsv(Color.hsluvToRgb(color))
                this.gl.uniform3f(this.colorLocation, hsv.h, hsv.s, hsv.v)
                break
            }
            case ColorMode.Hsluv: {
                this.gl.uniform3f(this.colorLocation, color.h, color.s, color.l)
                break
            }
        }

        this.gl.drawArrays(WebGLRenderingContext.TRIANGLE_STRIP, 0, 4)
    }

    dispose(): void {
        this.gl.deleteBuffer(this.buffer)
        this.gl.deleteProgram(this.program)
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

class SatValRenderer {
    private readonly buffer: WebGLBuffer
    private colorLocation: WebGLUniformLocation | null = null
    private program: WebGLProgram | null = null
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

    render(colorType: ColorMode, color: Color.Hsluv): void {
        const gl = this.gl

        if (!this.program || this.prevColor!.is(color)) {
            if (this.program) {
                gl.deleteProgram(this.program)
            }

            switch (colorType) {
                case ColorMode.Hsv:
                    this.program = createProgram(gl, SATVAL_VERT_SRC, SATVAL_FRAG_SRC_HSV)!
                    break
                case ColorMode.Hsluv:
                    this.program = createProgram(gl, SATVAL_VERT_SRC, SATVAL_FRAG_SRC_HSLUV)!
                    break
            }
            gl.bindAttribLocation(this.program!, 0, "a_position")
            this.colorLocation = gl.getUniformLocation(this.program!, "u_color")!
        }

        gl.useProgram(this.program)
        gl.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, this.buffer)

        gl.vertexAttribPointer(0, 2, WebGLRenderingContext.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(0)

        switch (colorType) {
            case ColorMode.Hsv: {
                const hsv = Color.rgbToHsv(Color.hsluvToRgb(color))
                this.gl.uniform3f(this.colorLocation, hsv.h, hsv.s, hsv.v)
                break
            }
            case ColorMode.Hsluv: {
                this.gl.uniform3f(this.colorLocation, color.h, color.s, color.l)
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
