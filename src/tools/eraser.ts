import * as Interp from "./interpolation"
import * as BrushDelay from "./brushDelay"
import * as BrushShader from "../canvas/brushShader"
import * as Camera from "./camera"
import * as Color from "color"
import { Vec2, clamp } from "../util"
import { TransformedPointerInput } from "../canvas"

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
    constructor(readonly diameterPx: number) {}
}
class SetSoftnessMsg {
    readonly type: MsgType.SetSoftnessMsg = MsgType.SetSoftnessMsg
    constructor(readonly softnessPct: number) {}
}
class SetOpacityMsg {
    readonly type: MsgType.SetOpacityMsg = MsgType.SetOpacityMsg
    constructor(readonly opacityPct: number) {}
}
class SetSpacingMsg {
    readonly type: MsgType.SetSpacingMsg = MsgType.SetSpacingMsg
    constructor(readonly spacingPct: number) {}
}
class SetPressureAffectsOpacityMsg {
    readonly type: MsgType.SetPressureAffectsOpacityMsg = MsgType.SetPressureAffectsOpacityMsg
    constructor(readonly pressureAffectsOpacity: boolean) {}
}
class SetPressureAffectsSizeMsg {
    readonly type: MsgType.SetPressureAffectsSizeMsg = MsgType.SetPressureAffectsSizeMsg
    constructor(readonly pressureAffectsSize: boolean) {}
}
class SetDelayMsg {
    readonly type: MsgType.SetDelayMsg = MsgType.SetDelayMsg
    constructor(readonly delayMs: number) {}
}

export class MsgSender {
    constructor(private sendMessage: (msg: Msg) => void) {}
    readonly setDelay = (ms: number): void => {
        this.sendMessage(new SetDelayMsg(ms))
    }
    readonly setDiameter = (px: number): void => {
        this.sendMessage(new SetDiameterMsg(px))
    }
    readonly setSoftness = (softness: number): void => {
        this.sendMessage(new SetSoftnessMsg(softness))
    }
    readonly setOpacity = (opacity: number): void => {
        this.sendMessage(new SetOpacityMsg(opacity))
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
}

function pointerToBrushInput(input: TransformedPointerInput): BrushDelay.Input {
    return new BrushDelay.Input(input.x, input.y, input.pressure)
}

export type State = {
    readonly interpState: Interp.State
    readonly delayState: BrushDelay.State
} | null

export function initTempState(): State {
    return null
}

export interface Config extends Interp.Config {
    readonly diameterPx: number
    readonly softness: number
    readonly flowPct: number
    readonly spacingPct: number
    readonly pressureAffectsOpacity: boolean
    readonly pressureAffectsSize: boolean
    readonly delay: BrushDelay.Config
}

export const init: Config = {
    diameterPx: 15,
    softness: 0.3,
    flowPct: 0.3,
    spacingPct: 0.05,
    pressureAffectsOpacity: false,
    pressureAffectsSize: true,
    delay: BrushDelay.delay(5),
}

export function update(state: Config, msg: Msg): Config {
    switch (msg.type) {
        case MsgType.SetDiameterMsg:
            return { ...state, diameterPx: clamp(msg.diameterPx, 0.1, 500) }

        case MsgType.SetSoftnessMsg:
            return { ...state, softness: clamp(msg.softnessPct, 0, 1) }

        case MsgType.SetOpacityMsg:
            return { ...state, flowPct: clamp(msg.opacityPct, 0.01, 1) }

        case MsgType.SetSpacingMsg:
            return { ...state, spacingPct: clamp(msg.spacingPct, 0.01, 1) }

        case MsgType.SetPressureAffectsOpacityMsg:
            return { ...state, pressureAffectsOpacity: msg.pressureAffectsOpacity }

        case MsgType.SetPressureAffectsSizeMsg:
            return { ...state, pressureAffectsSize: msg.pressureAffectsSize }

        case MsgType.SetDelayMsg:
            return { ...state, delay: BrushDelay.delay(clamp(msg.delayMs, 0, 500)) }

        default:
            const never: never = msg
            throw { "unexpected message": msg }
    }
}

export function onClick(
    state: Config,
    camera: Camera.Config,
    input: TransformedPointerInput
): [State, BrushShader.BrushPoint] {
    const brushInput = pointerToBrushInput(input)
    const interpState = Interp.init(createInputPoint(state, brushInput))
    const delayState = BrushDelay.init(input.time, brushInput)
    return [{ interpState, delayState }, createBrushPoint(state, brushInput)]
}

export function onDrag(
    state: Config,
    camera: Camera.Config,
    tempState: State,
    inputs: readonly TransformedPointerInput[]
): [State, readonly BrushShader.BrushPoint[]] {
    if (tempState === null) {
        const res = onClick(state, camera, inputs[0])
        return [res[0], [res[1]]]
    } else {
        let interpState: Interp.State = tempState.interpState
        let brushPoints: readonly BrushShader.BrushPoint[] = []
        let delayState = tempState.delayState
        for (let i = 0; i < inputs.length; i++) {
            const input = pointerToBrushInput(inputs[i])

            const updateResult = BrushDelay.updateWithInput(
                state.delay,
                delayState,
                inputs[i].time,
                input
            )

            const interpReslt = Interp.interpolate(
                interpState,
                state,
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
    state: Config,
    tempState: State,
    currentTime: number
): [State, readonly BrushShader.BrushPoint[]] {
    if (tempState === null || state.delay.duration < 0) {
        return [null, []]
    }

    const [delayState, newBrushInput] = BrushDelay.update(
        state.delay,
        tempState.delayState,
        currentTime
    )

    const [interpState, brushPoints] = Interp.interpolate(
        tempState.interpState,
        state,
        createInputPoint(state, newBrushInput)
    )

    return [{ delayState, interpState }, brushPoints]
}

export function onRelease(): [State, readonly BrushShader.BrushPoint[]] {
    return [null, []]
}

function createBrushPoint(state: Config, input: BrushDelay.Input): BrushShader.BrushPoint {
    return {
        alpha: state.flowPct * input.pressure,
        color: Color.RgbLinear.Black,
        position: new Vec2(input.x, input.y),
        rotation: 0,
        scaledDiameter: state.diameterPx * input.pressure,
    }
}

function createInputPoint(state: Config, input: BrushDelay.Input): Interp.InputPoint {
    return {
        alpha: state.flowPct * input.pressure,
        color: Color.RgbLinear.Black,
        position: new Vec2(input.x, input.y),
        pressure: input.pressure,
        rotation: 0,
    }
}
