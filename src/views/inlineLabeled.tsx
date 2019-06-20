import * as React from "react"
import * as styles from "./inlineLabeled.scss"

export interface InlineLabeledProps {
    readonly label: string
    readonly children: React.ReactChild
}

export function InlineLabeled({ children, label }: InlineLabeledProps): JSX.Element {
    return (
        <div className={styles.container}>
            <div className={styles.label}>{label}</div>
            {children}
        </div>
    )
}
