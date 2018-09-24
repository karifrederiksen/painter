import * as React from "react"

import styled from "../styled"
import * as Tools from "../tools"
import * as Color from "../color"
import * as BrushTool from "../tools/brushTool"
import { SinkableButton } from "../components/buttons"
import { Labeled } from "../components/labeled"
import { Slider } from "../components/slider"
import { Switch } from "../components/switch"
import { InlineLabeled } from "../components/inlineLabeled"
import { ColorDisplay } from "../components/colorDisplay"
import { YPadded } from "../components/padded"
import { ColorWheel } from "../components/colorWheel"
import { DropDown } from "../components/dropDown"
import { Row } from "../components/row"

export interface ToolbarProps {
    readonly msgSender: Tools.MsgSender
    readonly tool: Tools.Tool
    readonly transientState: TransientState
}

const LeftBar = styled.div`
    background-color: ${p => p.theme.surfaceColor.toStyle()};
    color: ${p => p.theme.onSurfaceColor.toStyle()};
    display: flex;
    flex-direction: column;
    padding-top: 1rem;
    margin-right: 0.25rem;

    > :not(:last-child) {
        margin-bottom: 0.125rem;
    }
    > :not(:last-child) {
        margin-bottom: 0.125rem;
    }
`

const ToolBarContainer = styled.div`
    display: flex;
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
            ) : (
                <></>
            )}
        </ToolBarContainer>
    )
}

export interface TransientState {
    readonly isDetailsExpanded: boolean
}

const Details = styled.div`
    background-color: ${p => p.theme.surfaceColor.toStyle()};
    color: ${p => p.theme.onSurfaceColor.toStyle()};
    display: flex;
    flex-direction: column;
    width: 12rem;
    padding: 0.5rem 0.75rem;
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
            <YPadded y={0.5}>
                <DropDown
                    choices={brush.colorMode}
                    show={BrushTool.showColorType}
                    onSelect={sender.setColorMode}
                />
            </YPadded>
            <ColorWheel
                color={brush.color}
                colorType={brush.colorMode.focus}
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
