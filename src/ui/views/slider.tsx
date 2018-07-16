import * as Inferno from "inferno"
import { css } from "emotion"
import { Hsv } from "core"
import { CSS_COLOR_DEFAULT, CSS_COLOR_PRIMARY, Rem } from "ui/css"

// Generic slider

export type SliderProps = {
    readonly percentage: number
    readonly onChange: (pct: number) => void
    readonly color?: Hsv
}

const containerClass = css`
    cursor: pointer;
    margin: 0.25rem 0;
    padding: 0.25rem 0;
    width: 100%;
    position: relative;
`

const baseLineClass = css`
    cursor: pointer;
    position: absolute;
    width: 100%;
    right: 0;
    height: 2px;
    top: 50%;
    transform: translate(0, -50%);
    background-color: ${CSS_COLOR_DEFAULT};
    z-index: 0;
`

const filledLineClass = css`
    cursor: pointer;
    position: absolute;
    height: 2px;
    top: 50%;
    transform: translate(0, -50%);
    background-color: ${CSS_COLOR_PRIMARY};
    z-index: 1;
`

const buttonClass = css`
    cursor: pointer;
    position: absolute;
    border-radius: 50%;
    width: 0.75rem;
    height: 0.75rem;
    transform: translate(0, -50%);
    background-color: ${CSS_COLOR_PRIMARY};
    z-index: 2;
    box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14),
        0 3px 1px -2px rgba(0, 0, 0, 0.12);
`

function clamp(x: number, min: number, max: number): number {
    return x < min ? min : x > max ? max : x
}

export class Slider extends Inferno.Component<SliderProps> {
    private container: HTMLDivElement | null = null
    private isDown: boolean = false

    render(): JSX.Element {
        const props = this.props
        const color = props.color !== undefined ? props.color.toRgb().toCss() : undefined
        const percentage = Math.max(0, Math.min(1, props.percentage))
        return (
            <div
                className={containerClass}
                onmousedown={this.onDown}
                ref={el => (this.container = el)}
            >
                <div
                    className={buttonClass}
                    style={{
                        left: "calc(" + percentage + " * calc(100% - 0.75rem))",
                        backgroundColor: color,
                    }}
                />
                <div
                    className={filledLineClass}
                    style={{
                        width: percentage * 100 + "%",
                        backgroundColor: color,
                    }}
                />
                <div className={baseLineClass} />
            </div>
        )
    }

    componentDidMount(): void {
        document.body.addEventListener("mousemove", this.onMove, { passive: true })
        document.body.addEventListener("mouseup", this.onUp, { passive: true })
    }

    componentWillUnmount(): void {
        document.body.removeEventListener("mousemove", this.onMove)
        document.body.removeEventListener("mouseup", this.onUp)
    }

    private onDown = (ev: MouseEvent): void => {
        this.signal(ev)
        this.isDown = true
    }

    private onUp = (_ev: MouseEvent): void => {
        this.isDown = false
    }

    private onMove = (ev: MouseEvent): void => {
        if (this.isDown) this.signal(ev)
    }

    private signal(ev: MouseEvent): void {
        const bounds = this.container!.getBoundingClientRect()
        const dotWidth = Rem * 0.75
        const width = bounds.width - dotWidth

        const localX = clamp(ev.clientX - bounds.left - dotWidth / 2, 0, width)

        this.props.onChange(localX / width)
    }
}
