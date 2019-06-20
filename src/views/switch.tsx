import * as React from "react"
import * as styles from "./switch.scss"

export interface SwitchProps {
    readonly checked: boolean
    readonly onCheck: (checked: boolean) => void
}

export function Switch(props: SwitchProps) {
    const { checked, onCheck } = props
    return (
        <span className={styles.xswitch} onClick={() => onCheck(!checked)}>
            <span
                className={styles.switchButtonContainer}
                style={{
                    transform: checked
                        ? "translate(0.75rem, -0.125rem)"
                        : "translate(0, -0.125rem)",
                }}
            >
                <span
                    className={
                        styles.switchButton +
                        " " +
                        (checked ? styles.bgColorPrimary : styles.bgColorSecondary)
                    }
                />
            </span>
            <span className={styles.switchBar} />
        </span>
    )
}
