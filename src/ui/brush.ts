import { Op, Events, onChange, onPaste, _, shallowEqual, statelessComponent } from "ivi"
import { div, input, VALUE } from "ivi-html"
import * as styles from "./brush.scss"
import {
    Menu,
    ColorWheel,
    Labeled,
    Slider,
    InlineLabeled,
    Switch,
    ColorDisplay,
    Surface,
} from "./views"
import * as Brush from "../tools/brush"
import * as Color from "color"
import { ColorMode, colorModeToString } from "../util"

export interface DetailsProps {
    readonly messageSender: Brush.MsgSender
    readonly tool: Brush.State
}

export const Details = statelessComponent<DetailsProps>(props => {
    const sender = props.messageSender
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
                Events(
                    onPaste(ev => onColorText((ev.target as any).value)),
                    Events(
                        onChange(ev => onColorText((ev.target as any).value)),
                        input(styles.textInput, {
                            type: "text",
                            style: { width: "100%" },
                            value: VALUE(brush.color.toStyle()),
                        })
                    )
                )
            ),
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
            ColorSliders({
                color: brush.color,
                colorType: brush.colorMode.focus,
                sender: sender,
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
}, shallowEqual)

function ColorSliders({
    sender,
    color,
    colorType,
}: {
    readonly sender: Brush.MsgSender
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

function HsluvSliders(sender: Brush.MsgSender, color: Color.Hsluv): Op {
    return [
        Labeled({
            label: "Hue",
            value: color.h.toFixed(2),
            children: Slider({
                percentage: color.h / 360,
                onChange: pct => sender.setColor(color.with({ h: pct * 360 })),
            }),
        }),
        Labeled({
            label: "Saturation",
            value: color.s.toFixed(2),
            children: Slider({
                percentage: color.s / 100,
                onChange: pct => sender.setColor(color.with({ s: pct * 100 })),
            }),
        }),
        Labeled({
            label: "Luminosity",
            value: color.l.toFixed(2),
            children: Slider({
                percentage: color.l / 100,
                onChange: pct => sender.setColor(color.with({ l: pct * 100 })),
            }),
        }),
    ]
}

function HsvSliders(sender: Brush.MsgSender, color: Color.Hsv): Op {
    return [
        Labeled({
            label: "Hue",
            value: color.h.toFixed(2),
            children: Slider({
                percentage: color.h,
                onChange: pct => sender.setColor(Color.rgbToHsluv(color.with({ h: pct }).toRgb())),
            }),
        }),
        Labeled({
            label: "Saturation",
            value: color.s.toFixed(2),
            children: Slider({
                percentage: color.s,
                onChange: pct => sender.setColor(Color.rgbToHsluv(color.with({ s: pct }).toRgb())),
            }),
        }),
        Labeled({
            label: "Value",
            value: color.v.toFixed(2),
            children: Slider({
                percentage: color.v,
                onChange: pct => sender.setColor(Color.rgbToHsluv(color.with({ v: pct }).toRgb())),
            }),
        }),
    ]
}
