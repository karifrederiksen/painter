import * as React from "react"
import styled from "styled-components"
import { Hsv } from "core"
import { RingRenderer } from "./ring"
import { SatValRenderer } from "./satVal"

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
        const color = Hsv.make(hue, prevColor.s, prevColor.v)
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

        const color = Hsv.make(this.props.color.h, pctX, pctY)
        this.props.onChange(color)
    }
}

function clamp(x: number, min: number, max: number): number {
    return x < min ? min : x > max ? max : x
}

function isInclusive(n: number, min: number, max: number): boolean {
    return n >= min && n <= max
}
