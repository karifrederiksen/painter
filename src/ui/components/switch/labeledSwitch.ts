import { InlineLabeled } from "../labeled"
import { Switch } from "./switch"
import { statelessComponent, shallowEqual } from "ivi"

export interface LabeledSwitchProps {
    readonly label: string
    readonly checked: boolean
    readonly onCheck: (checked: boolean) => void
}

export const LabeledSwitch = statelessComponent<LabeledSwitchProps>((props) => {
    return InlineLabeled({
        label: props.label,
        children: Switch({
            checked: props.checked,
            onCheck: props.onCheck,
        }),
    })
}, shallowEqual)
