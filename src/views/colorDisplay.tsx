import * as React from "react"
import { Hsluv } from "color"
import * as styles from "./colorDisplay.scss"

export interface ColorDisplay {
    readonly color: Hsluv
    readonly colorSecondary: Hsluv
    readonly onClick: () => void
}

export function ColorDisplay({ color, colorSecondary, onClick }: ColorDisplay): JSX.Element {
    return (
        <div className={styles.container} onClick={onClick}>
            <span
                className={styles.secondary}
                style={{
                    backgroundColor: colorSecondary.toStyle(),
                }}
            />
            <span
                className={styles.primary}
                style={{
                    backgroundColor: color.toStyle(),
                }}
            />
        </div>
    )
}
