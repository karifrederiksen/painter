import { Op, _ } from "ivi"
import { div } from "ivi-html"
import * as styles from "./eraser.scss"
import * as Interp from "./interpolation"
import * as BrushDelay from "./brushDelay"
import * as BrushShader from "../canvas/brushShader"
import * as Camera from "./camera"
import * as Input from "../input"
import * as Color from "color"
import { Vec2, clamp } from "../util"
import { Surface } from "../views/surface"
import { Labeled } from "../views/labeled"
import { Slider } from "../views/slider"
import { InlineLabeled } from "../views/inlineLabeled"
import { Switch } from "../views/switch"

export type Msg =
    | SetDiameterMsg
    | SetSoftnessMsg
    | SetOpacityMsg
    | SetSpacingMsg
    | SetPressureAffectsOpacityMsg
    | SetPressureAffectsSizeMsg
    | SetDelayMsg

export const enum MsgType {
    SetDiameterMsg,
    SetSoftnessMsg,
    SetOpacityMsg,
    SetSpacingMsg,
    SetPressureAffectsOpacityMsg,
    SetPressureAffectsSizeMsg,
    SetDelayMsg,
}

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
class SetDelayMsg {
    readonly type: MsgType.SetDelayMsg = MsgType.SetDelayMsg
    private nominal: void
    constructor(readonly delayMs: number) {}
}

export interface MsgSender {
    setDelay(ms: number): void
    setDiameter(px: number): void
    setSoftness(softness: number): void
    setOpacity(opacity: number): void
    setSpacing(px: number): void
    setPressureAffectsOpacity(setPressureAffectsOpacity: boolean): void
    setPressureAffectsSize(setPressureAffectsSize: boolean): void
}

export function createBrushSender(sendMessage: (msg: Msg) => void): MsgSender {
    return {
        setDelay: ms => sendMessage(new SetDelayMsg(ms)),
        setDiameter: px => sendMessage(new SetDiameterMsg(px)),
        setSoftness: pct => sendMessage(new SetSoftnessMsg(pct)),
        setOpacity: pct => sendMessage(new SetOpacityMsg(pct)),
        setSpacing: px => sendMessage(new SetSpacingMsg(px)),
        setPressureAffectsOpacity: x => sendMessage(new SetPressureAffectsOpacityMsg(x)),
        setPressureAffectsSize: x => sendMessage(new SetPressureAffectsSizeMsg(x)),
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
    readonly spacingPct: number
    readonly pressureAffectsOpacity: boolean
    readonly pressureAffectsSize: boolean
    readonly delay: BrushDelay.Config
}

export function init(): State {
    return {
        diameterPx: 15,
        softness: 0.3,
        flowPct: 0.3,
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
        case MsgType.SetSpacingMsg:
            return { ...state, spacingPct: clamp(0.01, 1, msg.spacingPct) }
        case MsgType.SetPressureAffectsOpacityMsg:
            return { ...state, pressureAffectsOpacity: msg.pressureAffectsOpacity }
        case MsgType.SetPressureAffectsSizeMsg:
            return { ...state, pressureAffectsSize: msg.pressureAffectsSize }
        case MsgType.SetDelayMsg:
            return { ...state, delay: BrushDelay.delay(clamp(0, 500, msg.delayMs)) }
        default:
            const never: never = msg
            throw { "unexpected message": msg }
    }
}

export function onClick(
    camera: Camera.State,
    state: State,
    input: Input.PointerInput
): [EphemeralState, BrushShader.BrushPoint] {
    const brushInput = pointerToBrushInput(camera, input)
    const interpState = Interp.init(createInputPoint(state, brushInput))
    const delayState = BrushDelay.init(input.time, brushInput)
    return [{ interpState, delayState }, createBrushPoint(state, brushInput)]
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
            let brushDelayInput = pointerToBrushInput(camera, input)

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
    state: State,
    tempState: EphemeralState,
    currentTime: number
): [EphemeralState, readonly BrushShader.BrushPoint[]] {
    if (tempState === null || state.delay.duration < 0) {
        return [null, []]
    }

    const [delayState, newBrushInput] = BrushDelay.update(
        state.delay,
        tempState.delayState,
        currentTime
    )

    const [interpState, brushPoints] = Interp.interpolate(
        state,
        tempState.interpState,
        createInputPoint(state, newBrushInput)
    )

    return [{ delayState, interpState }, brushPoints]
}

export function onRelease(
    camera: Camera.State,
    state: State,
    tempState: EphemeralState,
    input: Input.PointerInput
): [EphemeralState, readonly BrushShader.BrushPoint[]] {
    if (tempState === null) {
        return [null, []]
    }

    return [null, []]
}

function pointerToBrushInput(_camera: Camera.State, input: Input.PointerInput): BrushDelay.Input {
    // TODO: offset, zoom, and stuff
    return { x: input.x, y: input.y, pressure: input.pressure }
}

function createBrushPoint(state: State, input: BrushDelay.Input): BrushShader.BrushPoint {
    return {
        alpha: state.flowPct * input.pressure,
        color: Color.RgbLinear.Black,
        position: new Vec2(input.x, input.y),
        rotation: 0,
        scaledDiameter: state.diameterPx * input.pressure,
    }
}

function createInputPoint(state: State, input: BrushDelay.Input): Interp.InputPoint {
    return {
        alpha: state.flowPct * input.pressure,
        color: Color.RgbLinear.Black,
        position: new Vec2(input.x, input.y),
        pressure: input.pressure,
        rotation: 0,
    }
}

/*
 *
 * Views
 *
 */

export function Details(props: { readonly messageSender: MsgSender; readonly tool: State }): Op {
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
