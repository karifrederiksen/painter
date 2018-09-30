import * as Interp from "./interpolation"
import * as BrushDelay from "./brushDelay"
import * as BrushShader from "../rendering/brushShader"
import * as Camera from "./cameratools"
import * as Input from "../input"
import * as Color from "../color"
import { T2, Action, Vec2 } from "../util"
import { ZipperList } from "../zipperList"

export const enum BrushMsgType {
    SetDiameter,
    SetOpacity,
    SetColor,
    SetColorMode,
    SetSpacing,
    SetPressureAffectsOpacity,
    SetPressureAffectsSize,
    SwapColor,
    SetDelay,
}

export type Msg =
    | Action<BrushMsgType.SetDiameter, number>
    | Action<BrushMsgType.SetOpacity, number>
    | Action<BrushMsgType.SetColor, Color.Hsluv>
    | Action<BrushMsgType.SetColorMode, ColorType>
    | Action<BrushMsgType.SetSpacing, number>
    | Action<BrushMsgType.SetPressureAffectsOpacity, boolean>
    | Action<BrushMsgType.SetPressureAffectsSize, boolean>
    | Action<BrushMsgType.SwapColor>
    | Action<BrushMsgType.SetDelay, number>

export interface MsgSender {
    setColor(color: Color.Hsluv): void
    setColorMode(mode: ColorType): void
    setDelay(ms: number): void
    setDiameter(px: number): void
    setOpacity(opacity: number): void
    setSpacing(px: number): void
    setPressureAffectsOpacity(setPressureAffectsOpacity: boolean): void
    setPressureAffectsSize(setPressureAffectsSize: boolean): void
    swapColorFrom(previousColor: Color.Hsluv): void
}

export function createBrushSender(sendMessage: (msg: Msg) => void): MsgSender {
    return {
        setColor: color => sendMessage({ type: BrushMsgType.SetColor, payload: color }),
        setColorMode: mode => sendMessage({ type: BrushMsgType.SetColorMode, payload: mode }),
        setDelay: ms => sendMessage({ type: BrushMsgType.SetDelay, payload: ms }),
        setDiameter: px => sendMessage({ type: BrushMsgType.SetDiameter, payload: px }),
        setOpacity: pct => sendMessage({ type: BrushMsgType.SetOpacity, payload: pct }),
        setSpacing: px => sendMessage({ type: BrushMsgType.SetSpacing, payload: px }),
        setPressureAffectsOpacity: x =>
            sendMessage({ type: BrushMsgType.SetPressureAffectsOpacity, payload: x }),
        setPressureAffectsSize: x =>
            sendMessage({ type: BrushMsgType.SetPressureAffectsSize, payload: x }),
        swapColorFrom: () => sendMessage({ type: BrushMsgType.SwapColor, payload: undefined }),
    }
}

export const swapColorMsg: Msg = {
    type: BrushMsgType.SwapColor,
    payload: undefined,
}

export type TempState = {
    readonly interpState: Interp.State
    readonly delayState: BrushDelay.State
} | null

export function initTempState(): TempState {
    return null
}

export const enum ColorType {
    Hsv,
    Hsluv,
}

export function showColorType(type: ColorType): string {
    switch (type) {
        case ColorType.Hsv:
            return "Hsv"
        case ColorType.Hsluv:
            return "Hsluv"
    }
}

export interface State {
    readonly diameterPx: number
    readonly flowPct: number
    readonly colorMode: ZipperList<ColorType>
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
        flowPct: 0.3,
        colorMode: ZipperList.fromArray([ColorType.Hsluv, ColorType.Hsv])!,
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
        case BrushMsgType.SetDiameter:
            return { ...state, diameterPx: msg.payload }
        case BrushMsgType.SetOpacity:
            return { ...state, flowPct: msg.payload }
        case BrushMsgType.SetColor: {
            return { ...state, color: msg.payload }
        }
        case BrushMsgType.SetColorMode: {
            console.log("changing color mode to", msg.payload)
            return { ...state, colorMode: state.colorMode.focusf(x => x === msg.payload) }
        }
        case BrushMsgType.SetSpacing:
            return { ...state, spacingPct: msg.payload }
        case BrushMsgType.SetPressureAffectsOpacity:
            return { ...state, pressureAffectsOpacity: msg.payload }
        case BrushMsgType.SetPressureAffectsSize:
            return { ...state, pressureAffectsSize: msg.payload }
        case BrushMsgType.SwapColor: {
            return {
                ...state,
                color: state.colorSecondary,
                colorSecondary: state.color,
            }
        }
        case BrushMsgType.SetDelay:
            return { ...state, delay: BrushDelay.delay(msg.payload) }
    }
}

export function onClick(
    camera: Camera.State,
    brush: State,
    input: Input.PointerInput
): T2<TempState, BrushShader.BrushPoint> {
    const brushInput = pointerToBrushInput(camera, input)
    const interpState = Interp.init(createInputPoint(brush, brushInput))
    const delayState = BrushDelay.init(input.time, brushInput)
    return [{ interpState, delayState }, createBrushPoint(brush, brushInput)]
}

export function onDrag(
    camera: Camera.State,
    brush: State,
    state: TempState,
    input: Input.PointerInput
): T2<TempState, ReadonlyArray<BrushShader.BrushPoint>> {
    if (state === null) {
        const res = onClick(camera, brush, input)
        return [res[0], [res[1]]]
    }

    const brushInput = pointerToBrushInput(camera, input)
    const [delayState, newBrushInput] = BrushDelay.updateWithInput(
        brush.delay,
        state.delayState,
        input.time,
        brushInput
    )

    const [interpState, brushPoints] = Interp.interpolate(
        brush,
        state.interpState,
        createInputPoint(brush, newBrushInput)
    )

    return [{ delayState, interpState }, brushPoints]
}

export function onFrame(
    brush: State,
    state: TempState,
    currentTime: number
): T2<TempState, ReadonlyArray<BrushShader.BrushPoint>> {
    if (state === null) return [null, []]
    if (brush.delay.duration <= 0) return [null, []]

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
    state: TempState,
    input: Input.PointerInput
): T2<TempState, ReadonlyArray<BrushShader.BrushPoint>> {
    if (state === null) return [null, []]

    // const brushInput = pointerToBrushInput(camera, input)
    // const newBrushInput = brushDelay.updateWithInput(
    //     brush.delay,
    //     state.delayState,
    //     input.time,
    //     brushInput
    // )[1]

    // const brushPoints = interpolate(
    //     brush,
    //     state.interpState,
    //     createInputPoint(brush, newBrushInput)
    // )[1]

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
