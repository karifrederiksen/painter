import * as React from "react"
import * as styles from "./buttons.scss"

export function PrimaryButton(props: React.ComponentProps<"button">) {
    const { children, className: providedClassName, ...restProps } = props

    const className =
        providedClassName == null ? styles.primary : providedClassName + " " + styles.primary

    return (
        <button {...restProps} className={className}>
            {children}
        </button>
    )
}

export function DefaultButton(props: React.ComponentProps<"button">) {
    const { children, className: providedClassName, ...restProps } = props

    const className =
        providedClassName == null ? styles.ddefault : providedClassName + " " + styles.ddefault

    return (
        <button {...restProps} className={className}>
            {children}
        </button>
    )
}

export function SinkableButton(props: {
    readonly onClick: () => void
    readonly onDownClick?: () => void
    readonly isDown: boolean
    readonly children: React.ReactNode
}): JSX.Element {
    const className = props.isDown ? styles.sinkableSunk : styles.sinkableUnsunk
    return (
        <button onClick={props.isDown ? props.onDownClick : props.onClick} className={className}>
            {props.children}
        </button>
    )
}
