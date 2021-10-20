import { Op, _ } from "ivi"
import { div } from "ivi-html"
import * as styles from "./inlineLabeled.scss"

export interface InlineLabeledProps {
    readonly label: string
    readonly children: Op
}

export function InlineLabeled({ label, children }: InlineLabeledProps): Op {
    return div(styles.container, _, [div(styles.label, _, label), children])
}
