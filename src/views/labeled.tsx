import * as React from "react"
import * as styles from "./labeled.scss"

export interface LabeledProps {
    readonly label: string
    readonly value?: string
    readonly children: React.ReactChild
}

export function Labeled({ children, label, value }: LabeledProps): JSX.Element {
    return (
        <div className={styles.container}>
            <div className={styles.textContainer}>
                <p className={styles.label}>{label}</p>
                <p className={styles.label}>{value}</p>
            </div>
            <div className={styles.content}>{children}</div>
        </div>
    )
}
