import { Op, _, shallowEqual, statelessComponent } from "ivi"
import { div } from "ivi-html"
import * as styles from "./brush.scss"
import {
    Menu,
    ColorWheel,
    ColorDisplay,
    Surface,
    LabeledSlider,
    LabeledSwitch,
    TextInput,
} from "../components"
import * as Brush from "../../tools/brush"
import * as Color from "color"
import { ColorMode, colorModeToString, stringToFloat } from "../../util"

function toFixed2(pct: number): string {
    return pct.toFixed(2)
}
function toFixed1(px: number): string {
    return px.toFixed(1)
}
function toFixed0(ms: number): string {
    return ms.toFixed(0)
}

export interface DetailsProps {
    readonly sender: Brush.Sender
    readonly tool: Brush.Config
}

export const Details = statelessComponent<DetailsProps>((props) => {
    const sender = props.sender
    const brush = props.tool

    function onColorText(text: string) {
        const rgb = Color.Rgb.fromCss(text)
        if (rgb === null) {
            return
        }

        sender.setColor(Color.rgbToHsluv(rgb))
    }

    return Surface(
        div(styles.detailsContainer, _, [
            div(
                _,
                { style: { margin: "0.5rem 0" } },
                Menu({
                    choices: brush.colorMode,
                    show: colorModeToString,
                    onSelect: sender.setColorMode,
                })
            ),
            ColorWheel({
                color: brush.color,
                colorType: brush.colorMode.focus,
                onChange: sender.setColor,
            }),
            div(
                _,
                { style: { margin: "0.5rem 0", width: "100%" } },
                ColorDisplay({
                    color: brush.color,
                    colorSecondary: brush.colorSecondary,
                    onClick: sender.swapColorFrom,
                })
            ),
            div(
                _,
                { style: { margin: "0.5rem 0" } },
                TextInput({
                    initialValue: brush.color.toStyle(),
                    onChange: onColorText,
                })
            ),
            LabeledSlider({
                label: "Size",
                valuePostfix: "px",
                value: brush.diameterPx,
                fromString: stringToFloat,
                toString: toFixed1,

                percentage: brush.diameterPx / 500,
                onChange: (pct) => sender.setDiameter(pct * 500),
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
            ColorSliders({
                color: brush.color,
                colorType: brush.colorMode.focus,
                sender: sender,
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
                onChange: (pct) => sender.setDelay(pct * 500),
            }),
        ])
    )
}, shallowEqual)

function ColorSliders({
    sender,
    color,
    colorType,
}: {
    readonly sender: Brush.Sender
    readonly colorType: ColorMode
    readonly color: Color.Hsluv
}): Op {
    switch (colorType) {
        case ColorMode.Hsluv:
            return HsluvSliders(sender, color)
        case ColorMode.Hsv:
            return HsvSliders(sender, Color.rgbToHsv(color.toRgb()))
        default:
            const never: never = colorType
            throw { "unexpected color type": colorType }
    }
}

function HsluvSliders(sender: Brush.Sender, color: Color.Hsluv): Op {
    return [
        LabeledSlider({
            label: "Hue",
            value: color.h,
            fromString: stringToFloat,
            toString: toFixed2,
            percentage: color.h / 360,
            onChange: (pct) => sender.setColor(color.with({ h: pct * 360 })),
        }),
        LabeledSlider({
            label: "Saturation",
            value: color.s,
            fromString: stringToFloat,
            toString: toFixed2,
            percentage: color.s / 100,
            onChange: (pct) => sender.setColor(color.with({ s: pct * 100 })),
        }),
        LabeledSlider({
            label: "Luminosity",
            value: color.l,
            fromString: stringToFloat,
            toString: toFixed2,
            percentage: color.l / 100,
            onChange: (pct) => sender.setColor(color.with({ l: pct * 100 })),
        }),
    ]
}

function HsvSliders(sender: Brush.Sender, color: Color.Hsv): Op {
    return [
        LabeledSlider({
            label: "Hue",
            value: color.h,
            fromString: stringToFloat,
            toString: toFixed2,
            percentage: color.h,
            onChange: (pct) => sender.setColor(Color.rgbToHsluv(color.with({ h: pct }).toRgb())),
        }),
        LabeledSlider({
            label: "Saturation",
            value: color.s,
            fromString: stringToFloat,
            toString: toFixed2,
            percentage: color.s,
            onChange: (pct) => sender.setColor(Color.rgbToHsluv(color.with({ s: pct }).toRgb())),
        }),
        LabeledSlider({
            label: "Value",
            value: color.v,
            fromString: stringToFloat,
            toString: toFixed2,
            percentage: color.v,
            onChange: (pct) => sender.setColor(Color.rgbToHsluv(color.with({ v: pct }).toRgb())),
        }),
    ]
}
