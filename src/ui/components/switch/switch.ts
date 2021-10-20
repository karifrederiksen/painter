import { Op, Events, onClick, shallowEqual, statelessComponent } from "ivi"
import { span } from "ivi-html"
import * as styles from "./switch.scss"

export interface SwitchProps {
    readonly checked: boolean
    readonly onCheck: (checked: boolean) => void
}

export const Switch = statelessComponent<SwitchProps>(props => {
    function handler() {
        props.onCheck(!props.checked)
    }

    return Events(
        onClick(handler),
        span(styles.xswitch, undefined, [
            span(
                styles.switchButtonContainer,
                {
                    style: {
                        transform: props.checked
                            ? "translate(0.75rem, -0.125rem)"
                            : "translate(0, -0.125rem)",
                    },
                },
                span(
                    styles.switchButton +
                        " " +
                        (props.checked ? styles.bgColorPrimary : styles.bgColorSecondary)
                )
            ),
            span(styles.switchBar),
        ])
    )
}, shallowEqual)
