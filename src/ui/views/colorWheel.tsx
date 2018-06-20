import { css } from "emotion"
import { T2, Vec2, Rgb255, Hsv } from "../../data"
import { Component } from "inferno"

const RING_WIDTH = 20
const RING_MIX_BORDER = 2

function generateTexture(canvas: HTMLCanvasElement): void {
    const width = canvas.width
    const height = canvas.height
    const ctx = canvas.getContext("2d")!

    const imageData = ctx.createImageData(width, height)
    const buf = imageData.data
    let bufPos = 0

    const size = new Vec2(width, height)
    const center = new Vec2(width / 2, height / 2)
    const innerRad = center.x - RING_WIDTH
    const innerRad2 = center.x - RING_WIDTH + RING_MIX_BORDER
    const outerRad = center.x - RING_MIX_BORDER
    const outerRad2 = center.x

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const [{ r, g, b }, a] = wheelShader(
                center,
                innerRad,
                innerRad2,
                outerRad,
                outerRad2,
                x,
                y
            )
            buf[bufPos++] = r
            buf[bufPos++] = g
            buf[bufPos++] = b
            buf[bufPos++] = a
        }
    }

    ctx.putImageData(imageData, 0, 0)
}

function smoothstep(edge0: number, edge1: number, x: number): number {
    x = (x - edge0) / (edge1 - edge0)
    x = x < 0 ? 0 : x > 1 ? 1 : x
    return x * x * (3 - 2 * x)
}

function wheelShader(
    center: Vec2,
    innerRad1: number,
    innerRad2: number,
    outerRad1: number,
    outerRad2: number,
    x: number,
    y: number
): T2<Rgb255, number> {
    const xd = center.x - x
    const yd = center.y - y
    const dist = Math.sqrt(xd * xd + yd * yd)

    const rad = Math.atan2(yd, xd)
    const hue = (rad + Math.PI) / (Math.PI * 2)

    const alpha = smoothstep(innerRad1, innerRad2, dist) - smoothstep(outerRad1, outerRad2, dist)

    const hsv = Hsv.make(hue, 1, alpha)
    const rgb = hsv.toRgb()
    const color = rgb.toRgb255()
    return [color, (alpha * 255) | 0]
}

export type ColorWheelProps = {
    readonly color: Hsv
}

const containerClass = css`
    display: flex;
    justify-content: center;
    width: 100%;
`

export class ColorWheel extends Component<ColorWheelProps> {
    private ringCanvas: HTMLCanvasElement | null = null

    render(): JSX.Element {
        return (
            <div className={containerClass}>
                <canvas width="160" height="160" ref={c => (this.ringCanvas = c)} />
            </div>
        )
    }

    componentDidMount(): void {
        if (this.ringCanvas == null) throw "ringCanvas not found"

        generateTexture(this.ringCanvas)
    }

    shouldComponentUpdate() {
        return false
    }
}
