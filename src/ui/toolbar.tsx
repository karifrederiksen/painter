import * as React from "react"

import styled from "./styled"
import { SinkableButton } from "./views/buttons"
import { Labeled } from "./views/labeled"
import { Slider } from "./views/slider"
import { Switch } from "./views/switch"
import { InlineLabeled } from "./views/inlineLabeled"
import { ColorDisplay } from "./views/colorDisplay"
import { YPadded } from "./views/padded"
import { ColorWheel } from "ui/views/colorWheel"
import * as Tools from "canvas/tools"
import * as Color from "canvas/color"
import * as BrushTool from "canvas/tools/brushTool"

export interface ToolbarProps {
    readonly msgSender: Tools.MsgSender
    readonly tool: Tools.Tool
    readonly transientState: TransientState
}

const LeftBar = styled.div`
    display: flex;
    flex-direction: column;
    padding-top: 1rem;

    > :not(:last-child) {
        margin-bottom: 0.125rem;
    }
    > :not(:last-child) {
        margin-bottom: 0.125rem;
    }
`

const ToolBarContainer = styled.div`
    display: flex;
    background-color: ${p => p.theme.colorBg2.toStyle()};
    color: ${p => p.theme.colorTextLight.toStyle()};
`
export function View(props: ToolbarProps): JSX.Element {
    const currentToolType = props.tool.current.type
    const setTool = props.msgSender.setTool

    return (
        <ToolBarContainer>
            <LeftBar>
                <SinkableButton
                    dataKey="brush"
                    onClick={() => setTool(Tools.ToolType.Brush)}
                    isDown={currentToolType === Tools.ToolType.Brush}
                >
                    🖌
                </SinkableButton>
                <SinkableButton
                    dataKey="erase"
                    onClick={() => setTool(Tools.ToolType.Eraser)}
                    isDown={currentToolType === Tools.ToolType.Eraser}
                >
                    🔥
                </SinkableButton>
                <SinkableButton
                    dataKey="zoom"
                    onClick={() => setTool(Tools.ToolType.Zoom)}
                    isDown={currentToolType === Tools.ToolType.Zoom}
                >
                    🔍
                </SinkableButton>
            </LeftBar>
            {props.transientState.isDetailsExpanded ? (
                <BrushDetails
                    messageSender={props.msgSender}
                    tool={props.tool}
                    transientState={props.transientState}
                />
            ) : null}
        </ToolBarContainer>
    )
}

export interface TransientState {
    readonly isDetailsExpanded: boolean
}

const Details = styled.div`
    display: flex;
    flex-direction: column;
    width: 12rem;
    padding: 0.5rem 0.75rem;
    border-left: 0.25rem solid ${p => p.theme.colorBg1.toStyle()};
`

interface BrushDetailsProps {
    readonly messageSender: Tools.MsgSender
    readonly tool: Tools.Tool
    readonly transientState: TransientState
}

function BrushDetails(props: BrushDetailsProps): JSX.Element {
    const sender = props.messageSender.brush
    const brush = props.tool.brush
    const color = brush.color

    return (
        <Details>
            <ColorWheel
                color={brush.color}
                colorType={brush.colorType}
                onChange={sender.setColor}
            />
            <YPadded y={0.5}>
                <ColorDisplay
                    color={brush.color}
                    colorSecondary={brush.colorSecondary}
                    onClick={() => sender.swapColorFrom(brush.color)}
                />
            </YPadded>
            <YPadded y={0.5}>
                <input
                    type="text"
                    value={brush.color.toStyle()}
                    style={{ width: "100%" }}
                    onChange={text => {
                        const rgb = Color.Rgb.fromCss((text.target as any).value)
                        if (rgb === null) return

                        sender.setColor(Color.rgbToHsluv(rgb))
                    }}
                />
            </YPadded>
            <Labeled label="Size" value={brush.diameterPx.toFixed(1) + "px"}>
                <Slider
                    percentage={brush.diameterPx / 500}
                    onChange={pct => sender.setDiameter(pct * 500)}
                />
            </Labeled>
            <Labeled label="Flow" value={brush.flowPct.toFixed(2)}>
                <Slider percentage={brush.flowPct} onChange={sender.setOpacity} />
            </Labeled>
            <Labeled label="Spacing" value={brush.spacingPct.toFixed(2) + "%"}>
                <Slider percentage={brush.spacingPct} onChange={sender.setSpacing} />
            </Labeled>
            <ColorSliders sender={sender} color={color} colorType={brush.colorType} />
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
        </Details>
    )
}

function ColorSliders({
    sender,
    color,
    colorType,
}: Readonly<{
    sender: BrushTool.MsgSender
    colorType: BrushTool.ColorType
    color: Color.Hsluv
}>): JSX.Element {
    switch (colorType) {
        case BrushTool.ColorType.Hsluv:
            return HsluvSliders({ sender, color })
        default:
            return <></>
    }
}

function HsluvSliders({
    sender,
    color,
}: Readonly<{ sender: BrushTool.MsgSender; color: Color.Hsluv }>): JSX.Element {
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
