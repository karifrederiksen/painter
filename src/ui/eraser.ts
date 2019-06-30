import { Op, _ } from "ivi"
import { div } from "ivi-html"
import * as styles from "./eraser.scss"
import { Surface } from "./views/surface"
import { Labeled } from "./views/labeled"
import { Slider } from "./views/slider"
import { InlineLabeled } from "./views/inlineLabeled"
import { Switch } from "./views/switch"
import * as Eraser from "../tools/eraser"

export function Details(props: {
    readonly messageSender: Eraser.MsgSender
    readonly tool: Eraser.State
}): Op {
    const sender = props.messageSender
    const brush = props.tool

    return Surface(
        div(styles.detailsContainer, _, [
            Labeled({
                label: "Size",
                value: brush.diameterPx.toFixed(1) + "px",
                children: Slider({
                    percentage: brush.diameterPx / 500,
                    onChange: pct => sender.setDiameter(pct * 500),
                }),
            }),
            Labeled({
                label: "Softness",
                value: brush.softness.toFixed(2),
                children: Slider({
                    percentage: brush.softness,
                    onChange: sender.setSoftness,
                }),
            }),
            Labeled({
                label: "Flow",
                value: brush.flowPct.toFixed(2),
                children: Slider({
                    percentage: brush.flowPct,
                    onChange: sender.setOpacity,
                }),
            }),
            Labeled({
                label: "Spacing",
                value: brush.spacingPct.toFixed(2) + "%",
                children: Slider({
                    percentage: brush.spacingPct,
                    onChange: sender.setSpacing,
                }),
            }),
            InlineLabeled({
                label: "Pressure-Opacity",
                children: Switch({
                    checked: brush.pressureAffectsOpacity,
                    onCheck: sender.setPressureAffectsOpacity,
                }),
            }),
            InlineLabeled({
                label: "Pressure-Size",
                children: Switch({
                    checked: brush.pressureAffectsSize,
                    onCheck: sender.setPressureAffectsSize,
                }),
            }),
            Labeled({
                label: "Delay",
                value: brush.delay.duration.toFixed(0) + "ms",
                children: Slider({
                    percentage: brush.delay.duration / 500,
                    onChange: pct => sender.setDelay(pct * 500),
                }),
            }),
        ])
    )
}
