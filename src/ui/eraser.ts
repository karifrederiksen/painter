import { _, shallowEqual, statelessComponent } from "ivi"
import { div } from "ivi-html"
import * as styles from "./eraser.scss"
import { Surface, LabeledSlider, LabeledSwitch } from "./views"
import * as Eraser from "../tools/eraser"
import { stringToFloat } from "../util"

function toFixed0(ms: number): string {
    return ms.toFixed(0) + "ms"
}
function toFixed1(px: number): string {
    return px.toFixed(1)
}
function toFixed2(pct: number): string {
    return pct.toFixed(2)
}

export interface DetailsProps {
    readonly messageSender: Eraser.MsgSender
    readonly tool: Eraser.Config
}

export const Details = statelessComponent<DetailsProps>(props => {
    const sender = props.messageSender
    const brush = props.tool

    return Surface(
        div(styles.detailsContainer, _, [
            LabeledSlider({
                label: "Size",
                value: brush.diameterPx,
                fromString: stringToFloat,
                toString: toFixed1,
                percentage: brush.diameterPx / 500,
                onChange: pct => sender.setDiameter(pct * 500),
            }),
            LabeledSlider({
                label: "Softness",
                value: brush.softness,
                fromString: stringToFloat,
                toString: toFixed2,
                percentage: brush.softness,
                onChange: sender.setSoftness,
            }),
            LabeledSlider({
                label: "Flow",
                value: brush.flowPct,
                fromString: stringToFloat,
                toString: toFixed2,
                percentage: brush.flowPct,
                onChange: sender.setOpacity,
            }),
            LabeledSlider({
                label: "Spacing",
                valuePostfix: "%",
                value: brush.spacingPct,
                fromString: stringToFloat,
                toString: toFixed2,
                percentage: brush.spacingPct,
                onChange: sender.setSpacing,
            }),
            LabeledSwitch({
                label: "Pressure-Opacity",
                checked: brush.pressureAffectsOpacity,
                onCheck: sender.setPressureAffectsOpacity,
            }),
            LabeledSwitch({
                label: "Pressure-Size",
                checked: brush.pressureAffectsSize,
                onCheck: sender.setPressureAffectsSize,
            }),
            LabeledSlider({
                label: "Delay",
                valuePostfix: "ms",
                value: brush.delay.duration,
                fromString: stringToFloat,
                toString: toFixed0,
                percentage: brush.delay.duration / 500,
                onChange: pct => sender.setDelay(pct * 500),
            }),
        ])
    )
}, shallowEqual)
