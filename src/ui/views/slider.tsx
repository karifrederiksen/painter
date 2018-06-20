import * as Inferno from "inferno"
import { css } from "emotion"
import { Hsv } from "../../data"

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
    background-color: var(--color-default);
    z-index: 0;
`

const filledLineClass = css`
    cursor: pointer;
    position: absolute;
    height: 2px;
    top: 50%;
    transform: translate(0, -50%);
    background-color: var(--color-default-light);
    z-index: 1;
`

const buttonClass = css`
    cursor: pointer;
    position: absolute;
    border-radius: 50%;
    width: 0.75rem;
    height: 0.75rem;
    transform: translate(0, -50%);
    background-color: var(--color-default-light);
    z-index: 2;
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
        return (
            <div
                className={containerClass}
                onmousedown={this.onDown}
                ref={el => (this.container = el)}
            >
                <div
                    className={buttonClass}
                    style={{
                        left: "calc(" + props.percentage * 100 + "% - 0.3725rem",
                        backgroundColor: color,
                    }}
                />
                <div
                    className={filledLineClass}
                    style={{
                        width: props.percentage * 100 + "%",
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

    private onDown = (ev: Inferno.MouseEvent<Element>): void => {
        this.signal(ev)
        this.isDown = true
    }

    private onUp = (ev: MouseEvent): void => {
        this.isDown = false
    }

    private onMove = (ev: MouseEvent): void => {
        if (this.isDown) this.signal(ev)
    }

    private signal(ev: MouseEvent): void {
        const bounds = this.container!.getBoundingClientRect()
        const localX = clamp(ev.clientX - bounds.left, 0, bounds.width)

        this.props.onChange(localX / bounds.width)
    }
}
