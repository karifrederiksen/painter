import {
    component,
    Events,
    _,
    onClick,
    findDOMNode,
    useLayoutEffect,
    Op,
    box,
    OpState,
    Ref,
    shallowEqual,
} from "ivi"
import { div, button } from "ivi-html"
import styles from "./dialog.scss"

function noOp() {}

export interface DialogProps {
    readonly isOpen: boolean
    readonly onClose: () => void
    readonly content: Op
}
export const Dialog = component<DialogProps>(c => {
    const backgroundRef = box<OpState<HTMLDivElement> | null>(null)
    let onClose = noOp

    function onBackgroundClick(ev: MouseEvent) {
        if (ev.target === findDOMNode(backgroundRef)) {
            onClose()
        }
    }

    const preventOverflow = useLayoutEffect<boolean>(c, shouldPrevent => {
        document.body.style.overflow = shouldPrevent ? "hidden" : ""
    })

    return props => {
        onClose = props.onClose
        preventOverflow(props.isOpen)

        if (!props.isOpen) {
            return null
        }

        return Events(
            onClick(onBackgroundClick),
            Ref(
                backgroundRef,
                div(
                    styles.backgroundLayer,
                    _,
                    div(styles.container, _, [
                        div(styles.content, _, props.content),
                        div(styles.divider, _),
                        div(styles.footer, _, [
                            Events(onClick(props.onClose), button(_, _, "Close")),
                        ]),
                    ])
                )
            )
        )
    }
}, shallowEqual)
