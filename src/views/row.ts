import { Op, _ } from "ivi"
import { div } from "ivi-html"
import * as styles from "./row.scss"

export interface RowProps {
    readonly spacing?: string
    readonly children: readonly Op[]
}

export function Row({ spacing, children }: RowProps): Op {
    spacing = spacing || "0"
    const spacedChildren = new Array<Op>(children.length)

    if (children.length > 0) {
        spacedChildren[0] = div(styles.column, _, children[0])
        for (let i = 1; i < children.length; i++) {
            spacedChildren[i] = div(
                styles.column,
                { style: { "margin-left": spacing } },
                children[i]
            )
        }
    }

    return div(styles.row, _, spacedChildren)
}
