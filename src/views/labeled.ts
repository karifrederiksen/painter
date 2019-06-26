import { Op, _ } from "ivi"
import { div, p } from "ivi-html"
import * as styles from "./labeled.scss"

export interface LabledProps {
    readonly label: string
    readonly value: string
    readonly children: Op
}

export function Labeled({ label, value, children }: LabledProps): Op {
    return div(styles.container, _, [
        div(styles.textContainer, _, [p(styles.label, _, label), p(styles.label, _, value || "")]),
        div(styles.content, _, children),
    ])
}
