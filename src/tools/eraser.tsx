import * as React from "react"
import styled from "../styled"

import * as Interp from "./interpolation"
import * as BrushDelay from "./brushDelay"
import * as BrushShader from "../rendering/brushShader"
import * as Camera from "./camera"
import * as Input from "../input"
import * as Color from "../color"
import { T2, Action, Vec2, clamp } from "../util"
import { Surface } from "../components/surface"
import { Labeled } from "../components/labeled"
import { Slider } from "../components/slider"
import { InlineLabeled } from "../components/inlineLabeled"
import { Switch } from "../components/switch"

const enum MsgType {
    SetDiameter,
    SetSoftness,
    SetOpacity,
    SetSpacing,
    SetPressureAffectsOpacity,
    SetPressureAffectsSize,
    SetDelay,
}

export type Msg =
    | Action<MsgType.SetDiameter, number>
    | Action<MsgType.SetSoftness, number>
    | Action<MsgType.SetOpacity, number>
    | Action<MsgType.SetSpacing, number>
    | Action<MsgType.SetPressureAffectsOpacity, boolean>
    | Action<MsgType.SetPressureAffectsSize, boolean>
    | Action<MsgType.SetDelay, number>

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
        setDelay: ms => sendMessage({ type: MsgType.SetDelay, payload: ms }),
        setDiameter: px => sendMessage({ type: MsgType.SetDiameter, payload: px }),
        setSoftness: pct => sendMessage({ type: MsgType.SetSoftness, payload: pct }),
        setOpacity: pct => sendMessage({ type: MsgType.SetOpacity, payload: pct }),
        setSpacing: px => sendMessage({ type: MsgType.SetSpacing, payload: px }),
        setPressureAffectsOpacity: x =>
            sendMessage({ type: MsgType.SetPressureAffectsOpacity, payload: x }),
        setPressureAffectsSize: x =>
            sendMessage({ type: MsgType.SetPressureAffectsSize, payload: x }),
    }
}

export type TempState = {
    readonly interpState: Interp.State
    readonly delayState: BrushDelay.State
} | null

export function initTempState(): TempState {
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
        case MsgType.SetDiameter:
            return { ...state, diameterPx: clamp(0.1, 500, msg.payload) }
        case MsgType.SetSoftness:
            return { ...state, softness: clamp(0, 1, msg.payload) }
        case MsgType.SetOpacity:
            return { ...state, flowPct: clamp(0.01, 1, msg.payload) }
        case MsgType.SetSpacing:
            return { ...state, spacingPct: clamp(0.01, 1, msg.payload) }
        case MsgType.SetPressureAffectsOpacity:
            return { ...state, pressureAffectsOpacity: msg.payload }
        case MsgType.SetPressureAffectsSize:
            return { ...state, pressureAffectsSize: msg.payload }
        case MsgType.SetDelay:
            return { ...state, delay: BrushDelay.delay(clamp(0, 500, msg.payload)) }
    }
}

export function onClick(
    camera: Camera.State,
    state: State,
    input: Input.PointerInput
): T2<TempState, BrushShader.BrushPoint> {
    const brushInput = pointerToBrushInput(camera, input)
    const interpState = Interp.init(createInputPoint(state, brushInput))
    const delayState = BrushDelay.init(input.time, brushInput)
    return [{ interpState, delayState }, createBrushPoint(state, brushInput)]
}

export function onDrag(
    camera: Camera.State,
    state: State,
    tempState: TempState,
    input: Input.PointerInput
): T2<TempState, ReadonlyArray<BrushShader.BrushPoint>> {
    if (tempState === null) {
        const res = onClick(camera, state, input)
        return [res[0], [res[1]]]
    }

    const brushInput = pointerToBrushInput(camera, input)
    const [delayState, newBrushInput] = BrushDelay.updateWithInput(
        state.delay,
        tempState.delayState,
        input.time,
        brushInput
    )

    const [interpState, brushPoints] = Interp.interpolate(
        state,
        tempState.interpState,
        createInputPoint(state, newBrushInput)
    )

    return [{ delayState, interpState }, brushPoints]
}

export function onFrame(
    state: State,
    tempState: TempState,
    currentTime: number
): T2<TempState, ReadonlyArray<BrushShader.BrushPoint>> {
    if (tempState === null) return [null, []]
    if (state.delay.duration <= 0) return [null, []]

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
    tempState: TempState,
    input: Input.PointerInput
): T2<TempState, ReadonlyArray<BrushShader.BrushPoint>> {
    if (tempState === null) return [null, []]

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

const DetailsContainer = styled(Surface)`
    background-color: ${p => p.theme.color.surface.toStyle()};
    color: ${p => p.theme.color.onSurface.toStyle()};
    flex-direction: column;
    width: 12rem;
    padding: 0.5rem 0.75rem;
`
export function Details(props: {
    readonly messageSender: MsgSender
    readonly tool: State
}): JSX.Element {
    const sender = props.messageSender
    const brush = props.tool

    return (
        <DetailsContainer>
            <Labeled label="Size" value={brush.diameterPx.toFixed(1) + "px"}>
                <Slider
                    percentage={brush.diameterPx / 500}
                    onChange={pct => sender.setDiameter(pct * 500)}
                />
            </Labeled>
            <Labeled label="Softness" value={brush.softness.toFixed(2)}>
                <Slider percentage={brush.softness} onChange={sender.setSoftness} />
            </Labeled>
            <Labeled label="Flow" value={brush.flowPct.toFixed(2)}>
                <Slider percentage={brush.flowPct} onChange={sender.setOpacity} />
            </Labeled>
            <Labeled label="Spacing" value={brush.spacingPct.toFixed(2) + "%"}>
                <Slider percentage={brush.spacingPct} onChange={sender.setSpacing} />
            </Labeled>
            <InlineLabeled label="Pressure-Opacity">
                <Switch
                    checked={brush.pressureAffectsOpacity}
                    onCheck={sender.setPressureAffectsOpacity}
                />
            </InlineLabeled>
            <InlineLabeled label="Pressure-Size">
                <Switch
                    checked={brush.pressureAffectsSize}
                    onCheck={sender.setPressureAffectsSize}
                />
            </InlineLabeled>
            <Labeled label="Delay" value={brush.delay.duration.toFixed(0) + "ms"}>
                <Slider
                    percentage={brush.delay.duration / 500}
                    onChange={pct => sender.setDelay(pct * 500)}
                />
            </Labeled>
        </DetailsContainer>
    )
}
