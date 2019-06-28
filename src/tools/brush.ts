import { Op, Events, onChange, onPaste, component, _ } from "ivi"
import { div, input, VALUE } from "ivi-html"
import * as styles from "./brush.scss"
import * as Interp from "./interpolation"
import * as BrushDelay from "./brushDelay"
import * as BrushShader from "../canvas/brushShader"
import * as Camera from "./camera"
import * as Input from "../input"
import * as Color from "color"
import { Vec2, ColorMode, colorModeToString, clamp } from "../util"
import { ZipperList } from "../collections/zipperList"
import { Menu } from "../views/menu"
import { ColorWheel } from "../views/colorWheel"
import { Labeled } from "../views/labeled"
import { Slider } from "../views/slider"
import { InlineLabeled } from "../views/inlineLabeled"
import { Switch } from "../views/switch"
import { ColorDisplay } from "../views/colorDisplay"
import { Surface } from "../views/surface"

export const enum MsgType {
    SetDiameterMsg,
    SetSoftnessMsg,
    SetOpacityMsg,
    SetColorMsg,
    SetColorModeMsg,
    SetSpacingMsg,
    SetPressureAffectsOpacityMsg,
    SetPressureAffectsSizeMsg,
    SwapColorMsg,
    SetDelayMsg,
}

export type Msg =
    | SetDiameterMsg
    | SetSoftnessMsg
    | SetOpacityMsg
    | SetColorMsg
    | SetColorModeMsg
    | SetSpacingMsg
    | SetPressureAffectsOpacityMsg
    | SetPressureAffectsSizeMsg
    | SwapColorMsg
    | SetDelayMsg

class SetDiameterMsg {
    readonly type: MsgType.SetDiameterMsg = MsgType.SetDiameterMsg
    private nominal: void
    constructor(readonly diameterPx: number) {}
}
class SetSoftnessMsg {
    readonly type: MsgType.SetSoftnessMsg = MsgType.SetSoftnessMsg
    private nominal: void
    constructor(readonly softnessPct: number) {}
}
class SetOpacityMsg {
    readonly type: MsgType.SetOpacityMsg = MsgType.SetOpacityMsg
    private nominal: void
    constructor(readonly opacityPct: number) {}
}
class SetColorMsg {
    readonly type: MsgType.SetColorMsg = MsgType.SetColorMsg
    private nominal: void
    constructor(readonly color: Color.Hsluv) {}
}
class SetColorModeMsg {
    readonly type: MsgType.SetColorModeMsg = MsgType.SetColorModeMsg
    private nominal: void
    constructor(readonly mode: ColorMode) {}
}
class SetSpacingMsg {
    readonly type: MsgType.SetSpacingMsg = MsgType.SetSpacingMsg
    private nominal: void
    constructor(readonly spacingPct: number) {}
}
class SetPressureAffectsOpacityMsg {
    readonly type: MsgType.SetPressureAffectsOpacityMsg = MsgType.SetPressureAffectsOpacityMsg
    private nominal: void
    constructor(readonly pressureAffectsOpacity: boolean) {}
}
class SetPressureAffectsSizeMsg {
    readonly type: MsgType.SetPressureAffectsSizeMsg = MsgType.SetPressureAffectsSizeMsg
    private nominal: void
    constructor(readonly pressureAffectsSize: boolean) {}
}
class SwapColorMsg {
    readonly type: MsgType.SwapColorMsg = MsgType.SwapColorMsg
    private nominal: void
    constructor() {}
}
class SetDelayMsg {
    readonly type: MsgType.SetDelayMsg = MsgType.SetDelayMsg
    private nominal: void
    constructor(readonly delayMs: number) {}
}

export interface MsgSender {
    setColor(color: Color.Hsluv): void
    setColorMode(mode: ColorMode): void
    setDelay(ms: number): void
    setDiameter(px: number): void
    setOpacity(opacity: number): void
    setSoftness(softness: number): void
    setSpacing(px: number): void
    setPressureAffectsOpacity(setPressureAffectsOpacity: boolean): void
    setPressureAffectsSize(setPressureAffectsSize: boolean): void
    swapColorFrom(previousColor: Color.Hsluv): void
}

export function createBrushSender(sendMessage: (msg: Msg) => void): MsgSender {
    return {
        setColor: color => sendMessage(new SetColorMsg(color)),
        setColorMode: mode => sendMessage(new SetColorModeMsg(mode)),
        setDelay: ms => sendMessage(new SetDelayMsg(ms)),
        setDiameter: px => sendMessage(new SetDiameterMsg(px)),
        setOpacity: pct => sendMessage(new SetOpacityMsg(pct)),
        setSoftness: pct => sendMessage(new SetSoftnessMsg(pct)),
        setSpacing: px => sendMessage(new SetSpacingMsg(px)),
        setPressureAffectsOpacity: x => sendMessage(new SetPressureAffectsOpacityMsg(x)),
        setPressureAffectsSize: x => sendMessage(new SetPressureAffectsSizeMsg(x)),
        swapColorFrom: () => sendMessage(new SwapColorMsg()),
    }
}

export type EphemeralState = {
    readonly interpState: Interp.State
    readonly delayState: BrushDelay.State
} | null

export function initTempState(): EphemeralState {
    return null
}

export interface State extends Interp.Interpolatable {
    readonly diameterPx: number
    readonly softness: number
    readonly flowPct: number
    readonly colorMode: ZipperList<ColorMode>
    readonly color: Color.Hsluv
    readonly colorSecondary: Color.Hsluv
    readonly spacingPct: number
    // TODO: I'll want more fine-grained control over _how_ pressure affects things
    //       for that, I'll want some extra stuff: [min, max, interpFunc]
    readonly pressureAffectsOpacity: boolean
    readonly pressureAffectsSize: boolean
    readonly delay: BrushDelay.Config
}

export function init(): State {
    return {
        diameterPx: 15,
        softness: 0.4,
        flowPct: 0.3,
        colorMode: ZipperList.unsafeFromArray([ColorMode.Hsluv, ColorMode.Hsv]),
        color: new Color.Hsluv(73, 100, 16),
        colorSecondary: new Color.Hsluv(0, 0, 100),
        spacingPct: 0.05,
        pressureAffectsOpacity: false,
        pressureAffectsSize: true,
        delay: BrushDelay.delay(5),
    }
}

export function update(state: State, msg: Msg): State {
    switch (msg.type) {
        case MsgType.SetDiameterMsg:
            return { ...state, diameterPx: clamp(0.1, 500, msg.diameterPx) }
        case MsgType.SetSoftnessMsg:
            return { ...state, softness: clamp(0, 1, msg.softnessPct) }
        case MsgType.SetOpacityMsg:
            return { ...state, flowPct: clamp(0.01, 1, msg.opacityPct) }
        case MsgType.SetColorMsg:
            return { ...state, color: msg.color }
        case MsgType.SetColorModeMsg:
            return { ...state, colorMode: state.colorMode.focusf(x => x === msg.mode) }
        case MsgType.SetSpacingMsg:
            return { ...state, spacingPct: clamp(0.01, 1, msg.spacingPct) }
        case MsgType.SetPressureAffectsOpacityMsg:
            return { ...state, pressureAffectsOpacity: msg.pressureAffectsOpacity }
        case MsgType.SetPressureAffectsSizeMsg:
            return { ...state, pressureAffectsSize: msg.pressureAffectsSize }
        case MsgType.SwapColorMsg:
            return {
                ...state,
                color: state.colorSecondary,
                colorSecondary: state.color,
            }
        case MsgType.SetDelayMsg:
            return { ...state, delay: BrushDelay.delay(clamp(0, 500, msg.delayMs)) }
        default:
            const never: never = msg
            throw { "unexpected msg": msg }
    }
}

export function onClick(
    camera: Camera.State,
    brush: State,
    input: Input.PointerInput
): [EphemeralState, BrushShader.BrushPoint] {
    const brushInput = pointerToBrushInput(camera, input)
    const interpState = Interp.init(createInputPoint(brush, brushInput))
    const delayState = BrushDelay.init(input.time, brushInput)
    return [{ interpState, delayState }, createBrushPoint(brush, brushInput)]
}

export function onDrag(
    camera: Camera.State,
    state: State,
    tempState: EphemeralState,
    inputs: readonly Input.PointerInput[]
): [EphemeralState, readonly BrushShader.BrushPoint[]] {
    if (tempState === null) {
        const res = onClick(camera, state, inputs[0])
        return [res[0], [res[1]]]
    } else {
        let interpState: Interp.State = tempState.interpState
        let brushPoints: readonly BrushShader.BrushPoint[] = []
        let delayState = tempState.delayState
        for (let i = 0; i < inputs.length; i++) {
            const input = inputs[i]
            const brushDelayInput = pointerToBrushInput(camera, input)

            const updateResult = BrushDelay.updateWithInput(
                state.delay,
                delayState,
                input.time,
                brushDelayInput
            )

            const interpReslt = Interp.interpolate(
                state,
                interpState,
                createInputPoint(state, updateResult[1])
            )
            delayState = updateResult[0]
            interpState = interpReslt[0]
            brushPoints = brushPoints.concat(interpReslt[1])
        }

        return [{ delayState, interpState }, brushPoints]
    }
}

export function onFrame(
    brush: State,
    state: EphemeralState,
    currentTime: number
): [EphemeralState, readonly BrushShader.BrushPoint[]] {
    if (state === null) {
        return [null, []]
    }
    // if (brush.delay.duration <= 0) return [null, []]

    const [delayState, newBrushInput] = BrushDelay.update(
        brush.delay,
        state.delayState,
        currentTime
    )

    const [interpState, brushPoints] = Interp.interpolate(
        brush,
        state.interpState,
        createInputPoint(brush, newBrushInput)
    )

    return [{ delayState, interpState }, brushPoints]
}

export function onRelease(
    camera: Camera.State,
    brush: State,
    state: EphemeralState,
    input: Input.PointerInput
): [EphemeralState, readonly BrushShader.BrushPoint[]] {
    if (state === null) {
        return [null, []]
    }

    return [null, []]
}

function pointerToBrushInput(_camera: Camera.State, input: Input.PointerInput): BrushDelay.Input {
    // TODO: offset, zoom, and stuff
    return { x: input.x, y: input.y, pressure: input.pressure }
}

function createBrushPoint(brush: State, input: BrushDelay.Input): BrushShader.BrushPoint {
    const alpha = brush.flowPct * input.pressure
    const color =
        alpha === 1
            ? brush.color.toRgb().toLinear()
            : brush.color
                  .toRgb()
                  .toLinear()
                  .mix(1 - alpha, Color.RgbLinear.Black)
    const position = new Vec2(input.x, input.y)
    return {
        alpha,
        color,
        position,
        rotation: 0,
        scaledDiameter: brush.diameterPx * input.pressure,
    }
}

function createInputPoint(brush: State, input: BrushDelay.Input): Interp.InputPoint {
    const alpha = brush.flowPct * input.pressure
    const color =
        alpha === 1
            ? brush.color.toRgb().toLinear()
            : brush.color
                  .toRgb()
                  .toLinear()
                  .mix(1 - alpha, Color.RgbLinear.Black)
    const position = new Vec2(input.x, input.y)
    return {
        alpha,
        color,
        position,
        pressure: input.pressure,
        rotation: 0,
    }
}

/*
 *
 * Views
 *
 */

export interface DetailsProps {
    readonly messageSender: MsgSender
    readonly tool: State
}

export const Details = component<DetailsProps>(c => {
    return props => {
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
                        onClick: () => sender.swapColorFrom(brush.color),
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
    }
})

function ColorSliders({
    sender,
    color,
    colorType,
}: Readonly<{
    sender: MsgSender
    colorType: ColorMode
    color: Color.Hsluv
}>): Op {
    switch (colorType) {
        case ColorMode.Hsluv:
            return HsluvSliders(sender, color)
        case ColorMode.Hsv:
            return HsvSliders(sender, Color.rgbToHsv(color.toRgb()))
    }
}

function HsluvSliders(sender: MsgSender, color: Color.Hsluv): Op {
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

function HsvSliders(sender: MsgSender, color: Color.Hsv): Op {
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
