import { Events, onClick, statelessComponent, shallowEqual } from "ivi"
import { div, span } from "ivi-html"
import * as styles from "./colorDisplay.scss"
import { Hsluv } from "color"

export interface ColorDisplay {
    readonly color: Hsluv
    readonly colorSecondary: Hsluv
    readonly onClick: () => void
}

export const ColorDisplay = statelessComponent((props: ColorDisplay) => {
    return Events(
        onClick(props.onClick),
        div(styles.container, undefined, [
            span(styles.secondary, {
                style: { "background-color": props.colorSecondary.toStyle() },
            }),
            span(styles.primary, { style: { "background-color": props.color.toStyle() } }),
        ])
    )
}, shallowEqual)
