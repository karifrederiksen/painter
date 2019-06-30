import * as Interp from "./interpolation"
import * as BrushDelay from "./brushDelay"
import * as BrushShader from "../canvas/brushShader"
import * as Camera from "./camera"
import * as Color from "color"
import { Vec2, ColorMode, clamp } from "../util"
import { ZipperList } from "../collections/zipperList"
import { TransformedPointerInput } from "../canvas"

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

export class MsgSender {
    constructor(private sendMessage: (msg: Msg) => void) {}

    readonly setColor = (color: Color.Hsluv): void => {
        this.sendMessage(new SetColorMsg(color))
    }
    readonly setColorMode = (mode: ColorMode): void => {
        this.sendMessage(new SetColorModeMsg(mode))
    }
    readonly setDelay = (ms: number): void => {
        this.sendMessage(new SetDelayMsg(ms))
    }
    readonly setDiameter = (px: number): void => {
        this.sendMessage(new SetDiameterMsg(px))
    }
    readonly setOpacity = (opacity: number): void => {
        this.sendMessage(new SetOpacityMsg(opacity))
    }
    readonly setSoftness = (softness: number): void => {
        this.sendMessage(new SetSoftnessMsg(softness))
    }
    readonly setSpacing = (px: number): void => {
        this.sendMessage(new SetSpacingMsg(px))
    }
    readonly setPressureAffectsOpacity = (setPressureAffectsOpacity: boolean): void => {
        this.sendMessage(new SetPressureAffectsOpacityMsg(setPressureAffectsOpacity))
    }
    readonly setPressureAffectsSize = (setPressureAffectsSize: boolean): void => {
        this.sendMessage(new SetPressureAffectsSizeMsg(setPressureAffectsSize))
    }
    readonly swapColorFrom = (): void => {
        this.sendMessage(new SwapColorMsg())
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
    input: TransformedPointerInput
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
    inputs: readonly TransformedPointerInput[]
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
    input: TransformedPointerInput
): [EphemeralState, readonly BrushShader.BrushPoint[]] {
    if (state === null) {
        return [null, []]
    }

    return [null, []]
}

function pointerToBrushInput(
    _camera: Camera.State,
    input: TransformedPointerInput
): BrushDelay.Input {
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
