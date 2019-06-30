import { Op, _ } from "ivi"
import { div } from "ivi-html"
import * as styles from "./surface.scss"

export const surfaceLook = styles.surfaceLook

export function Surface(children: Op) {
    return div(styles.surface, _, children)
}
