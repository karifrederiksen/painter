import { Op, Events, onClick } from "ivi"
import { button } from "ivi-html"
import * as styles from "./buttons.scss"

export interface ButtonProps {
    readonly onClick: () => void
    readonly title?: string
    readonly content: Op
}

export function PrimaryButton({ onClick: handler, title, content }: ButtonProps): Op {
    return Events(onClick(handler), button(styles.primary, { title }, content))
}

export function DefaultButton({ onClick: handler, title, content }: ButtonProps): Op {
    return Events(onClick(handler), button(styles.ddefault, { title }, content))
}

function noOp() {}

export function SinkableButton(props: {
    readonly onClick: () => void
    readonly onDownClick?: () => void
    readonly isDown: boolean
    readonly children: Op
    readonly title?: string
}): Op {
    const className = props.isDown ? styles.sinkableSunk : styles.sinkableUnsunk
    const handler = props.isDown ? props.onDownClick || noOp : props.onClick

    return Events(onClick(handler), button(className, { title: props.title }, props.children))
}
