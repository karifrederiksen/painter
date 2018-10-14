import * as React from "react"
import styled from "../styled"

import * as Interp from "./interpolation"
import * as BrushDelay from "./brushDelay"
import * as BrushShader from "../rendering/brushShader"
import * as Camera from "./camera"
import * as Input from "../input"
import * as Color from "../color"
import { T2, Action, Vec2, ColorMode, colorModeToString, clamp } from "../util"
import { ZipperList } from "../zipperList"
import { Menu } from "../components/menu"
import { ColorWheel } from "../components/colorWheel"
import { Labeled } from "../components/labeled"
import { Slider } from "../components/slider"
import { InlineLabeled } from "../components/inlineLabeled"
import { Switch } from "../components/switch"
import { ColorDisplay } from "../components/colorDisplay"
import { Surface } from "../components/surface"

const enum MsgType {
    SetDiameter,
    SetSoftness,
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
    | Action<MsgType.SetDiameter, number>
    | Action<MsgType.SetSoftness, number>
    | Action<MsgType.SetOpacity, number>
    | Action<MsgType.SetColor, Color.Hsluv>
    | Action<MsgType.SetColorMode, ColorMode>
    | Action<MsgType.SetSpacing, number>
    | Action<MsgType.SetPressureAffectsOpacity, boolean>
    | Action<MsgType.SetPressureAffectsSize, boolean>
    | Action<MsgType.SwapColor>
    | Action<MsgType.SetDelay, number>

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
        setColor: color => sendMessage({ type: MsgType.SetColor, payload: color }),
        setColorMode: mode => sendMessage({ type: MsgType.SetColorMode, payload: mode }),
        setDelay: ms => sendMessage({ type: MsgType.SetDelay, payload: ms }),
        setDiameter: px => sendMessage({ type: MsgType.SetDiameter, payload: px }),
        setOpacity: pct => sendMessage({ type: MsgType.SetOpacity, payload: pct }),
        setSoftness: pct => sendMessage({ type: MsgType.SetSoftness, payload: pct }),
        setSpacing: px => sendMessage({ type: MsgType.SetSpacing, payload: px }),
        setPressureAffectsOpacity: x =>
            sendMessage({ type: MsgType.SetPressureAffectsOpacity, payload: x }),
        setPressureAffectsSize: x =>
            sendMessage({ type: MsgType.SetPressureAffectsSize, payload: x }),
        swapColorFrom: () => sendMessage({ type: MsgType.SwapColor, payload: undefined }),
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
        colorMode: ZipperList.fromArray([ColorMode.Hsluv, ColorMode.Hsv])!,
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
        case MsgType.SetDiameter:
            return { ...state, diameterPx: clamp(0.1, 500, msg.payload) }
        case MsgType.SetSoftness:
            return { ...state, softness: clamp(0, 1, msg.payload) }
        case MsgType.SetOpacity:
            return { ...state, flowPct: clamp(0.01, 1, msg.payload) }
        case MsgType.SetColor: {
            return { ...state, color: msg.payload }
        }
        case MsgType.SetColorMode: {
            return { ...state, colorMode: state.colorMode.focusf(x => x === msg.payload) }
        }
        case MsgType.SetSpacing:
            return { ...state, spacingPct: clamp(0.01, 1, msg.payload) }
        case MsgType.SetPressureAffectsOpacity:
            return { ...state, pressureAffectsOpacity: msg.payload }
        case MsgType.SetPressureAffectsSize:
            return { ...state, pressureAffectsSize: msg.payload }
        case MsgType.SwapColor: {
            return {
                ...state,
                color: state.colorSecondary,
                colorSecondary: state.color,
            }
        }
        case MsgType.SetDelay:
            return { ...state, delay: BrushDelay.delay(clamp(0, 500, msg.payload)) }
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

const TextInput = styled.input`
    background-color: ${p => p.theme.color.surface.toStyle()};
    color: ${p => p.theme.color.onSurface.toStyle()};
    padding: 0.25rem 0;
    border-radius: 0.25rem;
    font-family: ${p => p.theme.fonts.monospace};

    &:focus {
        background-color: ${p => p.theme.color.secondary.toStyle()};
        color: ${p => p.theme.color.onSecondary.toStyle()};
        padding: 0.25rem 0.5rem;
    }
`

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
    const color = brush.color

    return (
        <DetailsContainer>
            <div style={{ margin: "0.5rem 0" }}>
                <Menu
                    choices={brush.colorMode}
                    show={colorModeToString}
                    onSelect={sender.setColorMode}
                />
            </div>
            <ColorWheel
                color={brush.color}
                colorType={brush.colorMode.focus}
                onChange={sender.setColor}
            />
            <div style={{ margin: "0.5rem 0", width: "100%" }}>
                <ColorDisplay
                    color={brush.color}
                    colorSecondary={brush.colorSecondary}
                    onClick={() => sender.swapColorFrom(brush.color)}
                />
            </div>
            <div style={{ margin: "0.5rem 0" }}>
                <TextInput
                    type="text"
                    value={brush.color.toStyle()}
                    style={{ width: "100%" }}
                    onChange={text => {
                        const rgb = Color.Rgb.fromCss((text.target as any).value)
                        if (rgb === null) return

                        sender.setColor(Color.rgbToHsluv(rgb))
                    }}
                />
            </div>
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
            <ColorSliders sender={sender} color={color} colorType={brush.colorMode.focus} />
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

function ColorSliders({
    sender,
    color,
    colorType,
}: Readonly<{
    sender: MsgSender
    colorType: ColorMode
    color: Color.Hsluv
}>): JSX.Element {
    switch (colorType) {
        case ColorMode.Hsluv:
            return HsluvSliders(sender, color)
        case ColorMode.Hsv:
            return HsvSliders(sender, Color.rgbToHsv(color.toRgb()))
    }
}

function HsluvSliders(sender: MsgSender, color: Color.Hsluv): JSX.Element {
    return (
        <>
            <Labeled label="Hue" value={color.h.toFixed(2)}>
                <Slider
                    percentage={color.h / 360}
                    onChange={pct => sender.setColor(color.withH(pct * 360))}
                />
            </Labeled>
            <Labeled label="Saturation" value={color.s.toFixed(2)}>
                <Slider
                    percentage={color.s / 100}
                    onChange={pct => sender.setColor(color.withS(pct * 100))}
                />
            </Labeled>
            <Labeled label="Luminosity" value={color.l.toFixed(2)}>
                <Slider
                    percentage={color.l / 100}
                    onChange={pct => sender.setColor(color.withL(pct * 100))}
                />
            </Labeled>
        </>
    )
}

function HsvSliders(sender: MsgSender, color: Color.Hsv): JSX.Element {
    return (
        <>
            <Labeled label="Hue" value={color.h.toFixed(2)}>
                <Slider
                    percentage={color.h}
                    onChange={pct => sender.setColor(Color.rgbToHsluv(color.withH(pct).toRgb()))}
                />
            </Labeled>
            <Labeled label="Saturation" value={color.s.toFixed(2)}>
                <Slider
                    percentage={color.s}
                    onChange={pct => sender.setColor(Color.rgbToHsluv(color.withS(pct).toRgb()))}
                />
            </Labeled>
            <Labeled label="Value" value={color.v.toFixed(2)}>
                <Slider
                    percentage={color.v}
                    onChange={pct => sender.setColor(Color.rgbToHsluv(color.withV(pct).toRgb()))}
                />
            </Labeled>
        </>
    )
}
