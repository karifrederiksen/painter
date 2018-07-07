import { T2, Vec2, Hsv, LinearRgb } from "../../../core"
import { InterpolatorState, InputPoint, interpolate, init as interpInit } from "./interpolation"
import { DelayState, BrushInput, DelayConfig } from "./brushDelay"
import * as brushDelay from "./brushDelay"
import { BrushPoint } from "../../rendering/brushShader"
import { Camera } from "../cameratools"
import { PointerInput } from "../../input"
import { BrushMsg, BrushMsgType } from "./messages"

export type BrushTempState = {
    readonly interpState: InterpolatorState
    readonly delayState: DelayState
} | null

export function initTempState(): BrushTempState {
    return null
}

export interface BrushTool {
    readonly diameterPx: number
    readonly flowPct: number
    readonly color: Hsv
    readonly colorSecondary: Hsv
    readonly spacingPct: number
    // TODO: I'll want more fine-grained control over _how_ pressure affects things
    //       for that, I'll want some extra stuff: [min, max, interpFunc]
    readonly pressureAffectsOpacity: boolean
    readonly pressureAffectsSize: boolean
    readonly delay: DelayConfig
}

export function init(): BrushTool {
    return {
        diameterPx: 30,
        flowPct: 0.15,
        color: Hsv.make(0.73, 1, 0.16),
        colorSecondary: Hsv.make(0, 0, 1),
        spacingPct: 0.05,
        pressureAffectsOpacity: false,
        pressureAffectsSize: true,
        delay: brushDelay.delay(50),
    }
}

export function update(state: BrushTool, msg: BrushMsg): BrushTool {
    switch (msg.type) {
        case BrushMsgType.SetDiameter:
            return { ...state, diameterPx: msg.payload }
        case BrushMsgType.SetOpacity:
            return { ...state, flowPct: msg.payload }
        case BrushMsgType.SetColor:
            return { ...state, color: msg.payload }
        case BrushMsgType.SetSpacing:
            return { ...state, spacingPct: msg.payload }
        case BrushMsgType.SetPressureAffectsOpacity:
            return { ...state, pressureAffectsOpacity: msg.payload }
        case BrushMsgType.SetPressureAffectsSize:
            return { ...state, pressureAffectsSize: msg.payload }
        case BrushMsgType.SwapColorFrom:
            if (msg.payload.eq(state.color))
                return {
                    ...state,
                    color: state.colorSecondary,
                    colorSecondary: state.color,
                }
            else return state
        case BrushMsgType.SetDelay:
            return { ...state, delay: brushDelay.delay(msg.payload) }
    }
}

export function onClick(
    camera: Camera,
    brush: BrushTool,
    input: PointerInput
): T2<BrushTempState, BrushPoint> {
    const brushInput = pointerToBrushInput(camera, input)
    const interpState = interpInit(createInputPoint(brush, brushInput))
    const delayState = brushDelay.init(input.time, brushInput)
    return [{ interpState, delayState }, createBrushPoint(brush, brushInput)]
}

export function onDrag(
    camera: Camera,
    brush: BrushTool,
    state: BrushTempState,
    input: PointerInput
): T2<BrushTempState, ReadonlyArray<BrushPoint>> {
    if (state === null) {
        const res = onClick(camera, brush, input)
        return [res[0], [res[1]]]
    }

    const brushInput = pointerToBrushInput(camera, input)
    const [delayState, newBrushInput] = brushDelay.updateWithInput(
        brush.delay,
        state.delayState,
        input.time,
        brushInput
    )

    const [interpState, brushPoints] = interpolate(
        brush,
        state.interpState,
        createInputPoint(brush, newBrushInput)
    )

    return [{ delayState, interpState }, brushPoints]
}

export function onFrame(
    brush: BrushTool,
    state: BrushTempState,
    currentTime: number
): T2<BrushTempState, ReadonlyArray<BrushPoint>> {
    if (state === null) return [null, []]
    if (brush.delay.duration <= 0) return [null, []]

    const [delayState, newBrushInput] = brushDelay.update(
        brush.delay,
        state.delayState,
        currentTime
    )

    const [interpState, brushPoints] = interpolate(
        brush,
        state.interpState,
        createInputPoint(brush, newBrushInput)
    )

    return [{ delayState, interpState }, brushPoints]
}

export function onRelease(
    camera: Camera,
    brush: BrushTool,
    state: BrushTempState,
    input: PointerInput
): T2<BrushTempState, ReadonlyArray<BrushPoint>> {
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

function pointerToBrushInput(_camera: Camera, input: PointerInput): BrushInput {
    // TODO: offset, zoom, and stuff
    return { x: input.x, y: input.y, pressure: input.pressure }
}

function createBrushPoint(brush: BrushTool, input: BrushInput): BrushPoint {
    const alpha = brush.flowPct * input.pressure
    const color =
        alpha === 1
            ? brush.color.toLinearRgb()
            : brush.color.toLinearRgb().mix(1 - alpha, LinearRgb.Black)
    const position = new Vec2(input.x, input.y)
    return {
        alpha,
        color,
        position,
        rotation: 0,
        scaledDiameter: brush.diameterPx * input.pressure,
    }
}

function createInputPoint(brush: BrushTool, input: BrushInput): InputPoint {
    const alpha = brush.flowPct * input.pressure
    const color =
        alpha === 1
            ? brush.color.toLinearRgb()
            : brush.color.toLinearRgb().mix(1 - alpha, LinearRgb.Black)
    const position = new Vec2(input.x, input.y)
    return {
        alpha,
        color,
        position,
        pressure: input.pressure,
        rotation: 0,
    }
}
