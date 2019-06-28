import {
    Op,
    component,
    Events,
    onMouseDown,
    useEffect,
    Ref,
    box,
    invalidate,
    OpState,
    findDOMNode,
    _,
    useMutationEffect,
    scheduleMicrotask,
    UpdateFlags,
} from "ivi"
import { div, canvas } from "ivi-html"
import * as styles from "./colorWheel.scss"
import * as Color from "color"
import { DEFINE_TAU, createProgram, DEFINE_hsluv_etc, DEFINE_hsvToRgb } from "../webgl"
import { ColorMode } from "../util"

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

function noOp() {}

export const ColorWheel = component<ColorWheelProps>(c => {
    const containerRef = box<OpState<HTMLDivElement> | null>(null)
    const canvasRef = box<OpState<HTMLCanvasElement> | null>(null)
    let glState: GlState | null = null
    let pointerState = PointerState.Default
    let color = new Color.Hsluv(0, 0, 0)
    let colorMode = ColorMode.Hsluv
    let colorHandler: (color: Color.Hsluv) => void = noOp

    function signalOuter(ev: WithClientXY) {
        // get xy delta from the center of the ring
        const bounds = findDOMNode<HTMLDivElement>(containerRef)!.getBoundingClientRect()
        const x = ev.clientX - bounds.left - bounds.width * 0.5
        const y = ev.clientY - bounds.top - bounds.height * 0.5

        // calculate radians of the delta
        const rad = Math.atan2(y, x)

        // get hue from radians (keep in mind the ring is turned 50%)
        const hue = rad / (Math.PI * 2) + 0.5

        switch (colorMode) {
            case ColorMode.Hsv: {
                const hsv = Color.rgbToHsv(color.toRgb())
                colorHandler(Color.rgbToHsluv(hsv.with({ h: hue }).toRgb()))
                break
            }
            case ColorMode.Hsluv: {
                colorHandler(color.with({ h: hue * 360 }))
                break
            }
        }
        invalidate(c)
    }

    function signalInner(ev: WithClientXY) {
        const bounds = findDOMNode<HTMLDivElement>(containerRef)!.getBoundingClientRect()
        const marginX = bounds.width * MARGIN
        const marginY = bounds.height * MARGIN

        const width = bounds.width - marginX * 2
        const height = bounds.height - marginY * 2

        const x = clamp(ev.clientX - bounds.left - marginX, 0, width)
        const y = clamp(ev.clientY - bounds.top - marginY, 0, height)

        const pctX = x / width
        const pctY = 1 - y / height

        switch (colorMode) {
            case ColorMode.Hsv: {
                const hue = Color.rgbToHsv(color.toRgb()).h
                colorHandler(Color.rgbToHsluv(Color.hsvToRgb(new Color.Hsv(hue, pctX, pctY))))
                break
            }
            case ColorMode.Hsluv: {
                const hue = color.h
                colorHandler(new Color.Hsluv(hue, pctX * 100, pctY * 100))
                break
            }
        }
        invalidate(c)
    }

    const initializeCanvas = useMutationEffect(c, () => {
        const canvas = findDOMNode<HTMLCanvasElement>(canvasRef)
        if (canvas == null) {
            throw { "canvas ref not fonud": canvasRef }
        }

        glState = new GlState(canvas)

        scheduleMicrotask(() => invalidate(c, 1 as UpdateFlags.RequestSyncUpdate))
        return () => {
            if (glState) {
                glState.dispose()
            }
        }
    })

    const renderCanvas = useMutationEffect<{ colorMode: ColorMode; color: Color.Hsluv }>(
        c,
        args => {
            if (!glState) {
                return
            }
            glState.render(args.colorMode, args.color)
        },
        (a, b) => a.color.is(b.color) && a.colorMode === b.colorMode
    )

    const listenToMouse = useEffect(c, () => {
        function onUp(_ev: WithClientXY) {
            pointerState = PointerState.Default
        }

        function onMove(ev: WithClientXY) {
            switch (pointerState) {
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

        document.body.addEventListener("mouseup", onUp)
        document.body.addEventListener("mousemove", onMove, { passive: true })
        return () => {
            document.body.removeEventListener("mouseup", onUp)
            document.body.removeEventListener("mousemove", onMove)
        }
    })

    function onDown(ev: WithClientXY) {
        const bounds = findDOMNode<HTMLDivElement>(containerRef)!.getBoundingClientRect()
        const x = clamp(ev.clientX - bounds.left, 0, bounds.width)
        const y = clamp(ev.clientY - bounds.top, 0, bounds.height)

        const marginX = bounds.width * MARGIN
        const marginY = bounds.height * MARGIN

        const isInner =
            isInclusive(x, marginX, bounds.width - marginX) &&
            isInclusive(y, marginY, bounds.height - marginY)

        if (isInner) {
            pointerState = PointerState.DownOnInner
            signalInner(ev)
        } else {
            pointerState = PointerState.DownOnOuter
            signalOuter(ev)
        }
    }

    return props => {
        listenToMouse()
        initializeCanvas()
        renderCanvas({ colorMode: props.colorType, color: props.color })

        color = props.color
        colorMode = props.colorType
        colorHandler = props.onChange

        const canvasNode = findDOMNode<HTMLCanvasElement>(canvasRef)
        const thumbData =
            glState === null
                ? null
                : canvasNode === null
                ? null
                : glState.getThumbPositions(
                      props.colorType,
                      props.color,
                      canvasNode.getBoundingClientRect()
                  )

        return Events(
            onMouseDown(onDown),
            Ref(
                containerRef,
                div(
                    styles.container,
                    _,
                    div(_, _, [
                        Ref(canvasRef, canvas(_, { width: 160, height: 160 })),
                        div(
                            styles.cicleThumb,
                            thumbData === null
                                ? _
                                : {
                                      style: {
                                          left: thumbData.circleThumbX + "px",
                                          top: thumbData.circleThumbY + "px",
                                          "background-color": props.color.toStyle(),
                                          "border-color": props.color.l > 50 ? "black" : "white",
                                          transform: "rotate(" + thumbData.angle + "deg)",
                                      },
                                  }
                        ),
                        div(
                            styles.areaThumb,
                            thumbData === null
                                ? _
                                : {
                                      style: {
                                          left: thumbData.areaThumbX + "px",
                                          top: thumbData.areaThumbY + "px",
                                          "background-color": props.color.toStyle(),
                                          "border-color": props.color.l > 50 ? "black" : "white",
                                      },
                                  }
                        ),
                    ])
                )
            )
        )
    }
})

function clamp(x: number, min: number, max: number): number {
    return x < min ? min : x > max ? max : x
}

function isInclusive(n: number, min: number, max: number): boolean {
    return n >= min && n <= max
}

class GlState {
    private readonly gl: WebGLRenderingContext
    private readonly ringRenderer: RingRenderer
    private readonly satValRenderer: SatValRenderer

    constructor(canvas: HTMLCanvasElement) {
        const gl = canvas.getContext("webgl")
        if (gl === null) {
            throw "Failed to init webgl"
        }

        gl.blendFunc(WebGLRenderingContext.ONE, WebGLRenderingContext.ONE_MINUS_SRC_ALPHA)
        gl.enable(WebGLRenderingContext.BLEND)
        gl.disable(WebGLRenderingContext.DEPTH_TEST)

        this.gl = gl
        this.ringRenderer = new RingRenderer(gl)
        this.satValRenderer = new SatValRenderer(gl)
    }

    render(colorMode: ColorMode, color: Color.Hsluv) {
        this.gl.clearColor(0, 0, 0, 0)
        this.gl.clear(WebGLRenderingContext.COLOR_BUFFER_BIT)
        this.ringRenderer.render(colorMode, color)
        this.satValRenderer.render(colorMode, color)
    }

    getThumbPositions(colorType: ColorMode, color: Color.Hsluv, canvasRect: ClientRect | DOMRect) {
        let angle: number
        let xPct: number
        let yPct: number
        if (colorType === ColorMode.Hsluv) {
            angle = (color.h + 180) % 360
            xPct = color.s / 100
            yPct = color.l / 100
        } else {
            const hsv = Color.rgbToHsv(color.toRgb())
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

        return {
            angle,
            circleThumbX,
            circleThumbY,
            areaThumbX,
            areaThumbY,
        }
    }

    dispose() {
        this.ringRenderer.dispose()
        this.satValRenderer.dispose()
    }
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
        this.buffer = gl.createBuffer() as WebGLBuffer
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
                    this.program = createProgram(
                        this.gl,
                        RING_VERT_SRC,
                        RING_FRAG_SRC_HSV
                    ) as WebGLProgram
                    break
                case ColorMode.Hsluv:
                    this.program = createProgram(
                        this.gl,
                        RING_VERT_SRC,
                        RING_FRAG_SRC_HSLUV
                    ) as WebGLProgram
                    break
            }
            this.gl.bindAttribLocation(this.program as WebGLProgram, 0, "a_position")
            this.colorLocation = this.gl.getUniformLocation(
                this.program as WebGLProgram,
                "u_color"
            ) as WebGLUniformLocation
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
    private prevColorMode: ColorMode | null = null

    constructor(private readonly gl: WebGLRenderingContext) {
        this.buffer = gl.createBuffer() as WebGLBuffer
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

    render(colorMode: ColorMode, color: Color.Hsluv): void {
        const gl = this.gl

        if (!this.program || this.prevColorMode !== colorMode) {
            if (this.program) {
                gl.deleteProgram(this.program)
            }

            switch (colorMode) {
                case ColorMode.Hsv:
                    this.program = createProgram(gl, SATVAL_VERT_SRC, SATVAL_FRAG_SRC_HSV)
                    break
                case ColorMode.Hsluv:
                    this.program = createProgram(gl, SATVAL_VERT_SRC, SATVAL_FRAG_SRC_HSLUV)
                    break
                default:
                    const never: never = colorMode
                    throw { "unexpected color mode": colorMode }
            }

            gl.bindAttribLocation(this.program as WebGLProgram, 0, "a_position")
            this.colorLocation = gl.getUniformLocation(
                this.program as WebGLProgram,
                "u_color"
            ) as WebGLUniformLocation
        }
        gl.useProgram(this.program)
        gl.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, this.buffer)

        gl.vertexAttribPointer(0, 2, WebGLRenderingContext.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(0)

        switch (colorMode) {
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

        gl.drawArrays(WebGLRenderingContext.TRIANGLES, 0, 6)

        this.prevColorMode = colorMode
    }

    dispose(): void {
        const gl = this.gl
        gl.deleteBuffer(this.buffer)
        gl.deleteProgram(this.program)
    }
}
