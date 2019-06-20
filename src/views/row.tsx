import * as React from "react"
import * as styles from "./row.scss"

export interface RowProps {
    readonly spacing?: string
    readonly children: readonly React.ReactChild[]
}

export function Row({ spacing, children }: RowProps): JSX.Element {
    spacing = spacing || "0"
    const spacedChildren = new Array<React.ReactChild>(children.length)

    if (children.length > 0) {
        spacedChildren[0] = (
            <div className={styles.column} key="0">
                {children[0]}
            </div>
        )
        for (let i = 1; i < children.length; i++) {
            spacedChildren[i] = (
                <div className={styles.column} key={i.toString()} style={{ marginLeft: spacing }}>
                    {children[i]}
                </div>
            )
        }
    }

    return <div className={styles.row}>{spacedChildren}</div>
}
