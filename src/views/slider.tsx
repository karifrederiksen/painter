import * as React from "react"
import styled, { Rem } from "../styled"
import { Hsv } from "color"

// Generic slider

export interface SliderProps {
    readonly percentage: number
    readonly onChange: (pct: number) => void
    readonly color?: Hsv
}

const Container = styled.div`
    cursor: pointer;
    margin: 0.25rem 0;
    padding: 0.25rem 0;
    width: 100%;
    position: relative;
`

const BaseLine = styled.div`
    cursor: pointer;
    position: absolute;
    width: 100%;
    right: 0;
    height: 2px;
    top: 50%;
    transform: translate(0, -50%);
    background-color: ${p => p.theme.color.secondaryLight.toStyle()};
    z-index: 0;
`

const FilledLineClass = styled.div`
    cursor: pointer;
    position: absolute;
    height: 2px;
    top: 50%;
    transform: translate(0, -50%);
    background-color: ${p => p.theme.color.primary.toStyle()};
    z-index: 1;
`

const ButtonBase = styled.div`
    cursor: pointer;
    position: absolute;
    border-radius: 50%;
    width: 0.75rem;
    height: 0.75rem;
    transform: translate(0, -50%);
    z-index: 2;
    box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14),
        0 3px 1px -2px rgba(0, 0, 0, 0.12);
`

const EmptyButton = styled(ButtonBase)`
    background-color: ${p => p.theme.color.secondaryLight.toStyle()};
`

const Button = styled(ButtonBase)`
    background-color: ${p => p.theme.color.primary.toStyle()};
`

function clamp(x: number, min: number, max: number): number {
    return x < min ? min : x > max ? max : x
}

interface WithClientX { readonly clientX: number }

export const Slider = React.memo((props: SliderProps) => {
    const container = React.useRef<HTMLDivElement | null>(null)
    const [isDown, setIsDown] = React.useState(false)
    const color = props.color !== undefined ? props.color.toStyle() : undefined
    const percentage = Math.max(0, Math.min(1, props.percentage))

    function signal(ev: WithClientX): void {
        const bounds = container.current!.getBoundingClientRect()
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
        <Container onMouseDown={onDown}>
            <div ref={container}>
                {percentage === 0 ? (
                    <EmptyButton
                        style={{
                            left: "calc(" + percentage + " * calc(100% - 0.75rem))",
                            backgroundColor: color,
                        }}
                    />
                ) : (
                    <Button
                        style={{
                            left: "calc(" + percentage + " * calc(100% - 0.75rem))",
                            backgroundColor: color,
                        }}
                    />
                )}

                <FilledLineClass
                    style={{
                        width: percentage * 100 + "%",
                        backgroundColor: color,
                    }}
                />
                <BaseLine />
            </div>
        </Container>
    )
})