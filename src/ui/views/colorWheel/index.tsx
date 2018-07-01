import { css } from "emotion"
import { Component } from "inferno"
import { Hsv } from "../../../data"
import { RingRenderer } from "../colorWheel/ring"
import { TriangleRenderer } from "./triangle"

export type ColorWheelProps = {
    readonly color: Hsv
}

const containerClass = css`
    display: flex;
    justify-content: center;
    width: 100%;
`

export class ColorWheel extends Component<ColorWheelProps> {
    private gl: WebGLRenderingContext | null = null
    private ringRenderer: RingRenderer | null = null
    private triangleRenderer: TriangleRenderer | null = null

    render(): JSX.Element {
        return (
            <div className={containerClass}>
                <canvas width="160" height="160" ref={this.initialize} />
            </div>
        )
    }

    componentDidUpdate() {
        this.renderGL()
    }

    componentDidMount(): void {
        this.renderGL()
    }

    componentWillUnmount(): void {
        if (this.ringRenderer !== null) this.ringRenderer.dispose()
        if (this.triangleRenderer !== null) this.triangleRenderer.dispose()
    }

    shouldComponentUpdate(prevProps: ColorWheelProps) {
        return this.props.color !== prevProps.color
    }

    private initialize = (canvas: HTMLCanvasElement | null): void => {
        if (canvas === null) return

        const gl = canvas.getContext("webgl")
        if (gl === null) throw "Failed to init webgl"

        this.gl = gl
        this.ringRenderer = new RingRenderer(gl)
        this.triangleRenderer = new TriangleRenderer(gl)
    }

    private renderGL() {
        this.gl!.clearColor(0, 0, 0, 0)
        this.gl!.clear(WebGLRenderingContext.COLOR_BUFFER_BIT)
        this.ringRenderer!.render()
        this.triangleRenderer!.render(this.props.color)
    }
}
