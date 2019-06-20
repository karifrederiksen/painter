import * as React from "react"
import { Hsv } from "color"
import * as styles from "./slider.scss"

// Generic slider

export interface SliderProps {
    readonly percentage: number
    readonly onChange: (pct: number) => void
    readonly color?: Hsv
}

function clamp(x: number, min: number, max: number): number {
    return x < min ? min : x > max ? max : x
}

interface WithClientX {
    readonly clientX: number
}

export const Slider = React.memo((props: SliderProps) => {
    const container = React.useRef<HTMLDivElement | null>(null)
    const [isDown, setIsDown] = React.useState(false)
    const color = props.color !== undefined ? props.color.toStyle() : undefined
    const percentage = Math.max(0, Math.min(1, props.percentage))

    function signal(ev: WithClientX): void {
        const bounds = container.current!.getBoundingClientRect()
        const Rem = 16
        const dotWidth = Rem * 0.75
        const width = bounds.width - dotWidth

        const localX = clamp(ev.clientX - bounds.left - dotWidth / 2, 0, width)

        props.onChange(localX / width)
    }

    function onDown(ev: WithClientX) {
        signal(ev)
        setIsDown(true)
    }

    function onUp() {
        setIsDown(false)
    }

    function onMove(ev: WithClientX) {
        if (isDown) signal(ev)
    }

    React.useEffect(() => {
        document.body.addEventListener("mousemove", onMove, {
            passive: true,
        })
        return () => {
            document.body.removeEventListener("mousemove", onMove)
        }
    }, [isDown])

    React.useEffect(() => {
        document.body.addEventListener("mouseup", onUp, { passive: true })
        return () => {
            document.body.removeEventListener("mouseup", onUp)
        }
    }, [])

    return (
        <div className={styles.container} onMouseDown={onDown} ref={container}>
            {percentage === 0 ? (
                <div
                    className={styles.emptyButton}
                    style={{
                        left: "calc(" + percentage + " * calc(100% - 0.75rem))",
                        backgroundColor: color,
                    }}
                />
            ) : (
                <div
                    className={styles.button}
                    style={{
                        left: "calc(" + percentage + " * calc(100% - 0.75rem))",
                        backgroundColor: color,
                    }}
                />
            )}

            <div
                className={styles.filledLineClass}
                style={{
                    width: percentage * 100 + "%",
                    backgroundColor: color,
                }}
            />
            <div className={styles.baseLine} />
        </div>
    )
})
