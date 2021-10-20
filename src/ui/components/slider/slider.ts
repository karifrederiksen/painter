import {
    Op,
    box,
    OpState,
    component,
    Ref,
    onMouseDown,
    Events,
    invalidate,
    useEffect,
    findDOMNode,
    _,
    shallowEqual,
} from "ivi"
import { div } from "ivi-html"
import { Hsv } from "color"
import * as styles from "./slider.scss"
import { clamp } from "../../../util"

// Generic slider

export interface SliderProps {
    readonly percentage: number
    readonly onChange: (pct: number) => void
    readonly color?: Hsv
}

function noOp() {}

export const Slider = component<SliderProps>((c) => {
    const containerRef = box<OpState<HTMLDivElement> | null>(null)
    let isDown = false
    let handler: (pct: number) => void = noOp

    function signal(ev: MouseEvent): void {
        ev.preventDefault()
        const bounds = findDOMNode<HTMLDivElement>(containerRef)!.getBoundingClientRect()
        const Rem = 16
        const dotWidth = Rem * 0.75
        const width = bounds.width - dotWidth

        const localX = clamp(ev.clientX - bounds.left - dotWidth / 2, 0, width)

        handler(localX / width)
    }

    function onDown(ev: MouseEvent) {
        signal(ev)
        isDown = true
        invalidate(c)
    }

    function onUp() {
        isDown = false
        invalidate(c)
    }

    function onMove(ev: MouseEvent) {
        if (isDown) {
            signal(ev)
        }
    }

    const listenToMouse = useEffect(c, () => {
        document.body.addEventListener("mouseup", onUp, { passive: false })
        document.body.addEventListener("mousemove", onMove, {
            passive: false,
        })
        return () => {
            document.body.removeEventListener("mouseup", onUp)
            document.body.removeEventListener("mousemove", onMove)
        }
    })

    return (props) => {
        handler = props.onChange
        listenToMouse()
        const color = props.color !== undefined ? props.color.toStyle() : undefined
        const percentage = Math.max(0, Math.min(1, props.percentage))

        return Events(
            onMouseDown((ev) => onDown(ev), true),
            Ref(
                containerRef,
                div(styles.container, _, [
                    div(_, _, [
                        div(percentage === 0 ? styles.emptyButton : styles.button, {
                            style: {
                                left: "calc(" + percentage + " * calc(100% - 0.75rem))",
                                "background-color": color,
                            },
                        }),
                        div(styles.filledLineClass, {
                            style: {
                                width: percentage * 100 + "%",
                                "background-color": color,
                            },
                        }),
                        div(styles.baseLine),
                    ]),
                ])
            )
        )
    }
}, shallowEqual)
