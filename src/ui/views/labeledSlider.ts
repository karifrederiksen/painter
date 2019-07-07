import { Op, _, statelessComponent, shallowEqual } from "ivi"
import { Labeled } from "./labeled"
import { Slider } from "./slider"

export interface LabeledSlider<a> {
    readonly label: string
    readonly valuePostfix?: string
    readonly value: a
    readonly toString: (value: a) => string
    readonly fromString: (text: string) => a | null
    readonly percentage: number
    readonly onChange: (value: a) => void
}

const LabeledSlider_ = statelessComponent<LabeledSlider<unknown>>(props => {
    return Labeled({
        label: props.label,
        valuePostfix: props.valuePostfix,
        value: props.value,
        toString: props.toString,
        fromString: props.fromString,
        onChange: props.onChange,
        children: Slider({
            percentage: props.percentage,
            onChange: props.onChange,
        }),
    })
}, shallowEqual)

export function LabeledSlider<a>(props: LabeledSlider<a>) {
    return LabeledSlider_(props as any)
}
