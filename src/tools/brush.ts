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
class SetColorMsg {
    readonly type: MsgType.SetColorMsg = MsgType.SetColorMsg
    constructor(readonly color: Color.Hsluv) {}
}
class SetColorModeMsg {
    readonly type: MsgType.SetColorModeMsg = MsgType.SetColorModeMsg
    constructor(readonly mode: ColorMode) {}
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
class SwapColorMsg {
    readonly type: MsgType.SwapColorMsg = MsgType.SwapColorMsg
    constructor() {}
}
class SetDelayMsg {
    readonly type: MsgType.SetDelayMsg = MsgType.SetDelayMsg
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

export const init: Config = {
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

export function update(state: Config, msg: Msg): Config {
    switch (msg.type) {
        case MsgType.SetDiameterMsg:
            return { ...state, diameterPx: clamp(msg.diameterPx, 0.1, 500) }
        case MsgType.SetSoftnessMsg:
            return { ...state, softness: clamp(msg.softnessPct, 0, 1) }
        case MsgType.SetOpacityMsg:
            return { ...state, flowPct: clamp(msg.opacityPct, 0.01, 1) }
        case MsgType.SetColorMsg:
            return { ...state, color: msg.color }
        case MsgType.SetColorModeMsg:
            return { ...state, colorMode: state.colorMode.focusf((x) => x === msg.mode) }
        case MsgType.SetSpacingMsg:
            return { ...state, spacingPct: clamp(msg.spacingPct, 0.01, 1) }
        case MsgType.SetPressureAffectsOpacityMsg:
            return { ...state, pressureAffectsOpacity: msg.pressureAffectsOpacity }
        case MsgType.SetPressureAffectsSizeMsg:
            return { ...state, pressureAffectsSize: msg.pressureAffectsSize }
        case MsgType.SwapColorMsg:
            return { ...state, color: state.colorSecondary, colorSecondary: state.color }
        case MsgType.SetDelayMsg:
            return { ...state, delay: BrushDelay.delay(clamp(msg.delayMs, 0, 500)) }
        default:
            const never: never = msg
            throw { "unexpected msg": msg }
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
    }

    let interpState: Interp.State = tempState.interpState
    let brushPoints: readonly BrushShader.BrushPoint[] = []
    let delayState = tempState.delayState
    for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i]
        const brushDelayInput = pointerToBrushInput(input)

        const updateResult = BrushDelay.updateWithInput(
            state.delay,
            delayState,
            input.time,
            brushDelayInput
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

export function onFrame(
    state: Config,
    ephState: State,
    currentTime: number
): [State, readonly BrushShader.BrushPoint[]] {
    if (ephState === null) {
        return [null, []]
    }

    const [delayState, newBrushInput] = BrushDelay.update(
        state.delay,
        ephState.delayState,
        currentTime
    )

    const [interpState, brushPoints] = Interp.interpolate(
        ephState.interpState,
        state,
        createInputPoint(state, newBrushInput)
    )

    return [{ delayState, interpState }, brushPoints]
}

export function onRelease(): [State, readonly BrushShader.BrushPoint[]] {
    return [null, []]
}

function pointerToBrushInput(input: TransformedPointerInput): BrushDelay.Input {
    return new BrushDelay.Input(input.x, input.y, input.pressure)
}

function createBrushPoint(brush: Config, input: BrushDelay.Input): BrushShader.BrushPoint {
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

function createInputPoint(brush: Config, input: BrushDelay.Input): Interp.InputPoint {
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
