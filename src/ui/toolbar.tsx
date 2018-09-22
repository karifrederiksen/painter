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
import { MessageSender, Tool, ToolType } from "canvas"
import { Rgb, rgbToHsv } from "canvas/color"

export interface ToolBarProps {
    readonly messageSender: MessageSender
    readonly tool: Tool
    readonly transientState: ToolBarTransientState
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

export function ToolBar(props: ToolBarProps): JSX.Element {
    const currentToolType = props.tool.current.type
    const setTool = props.messageSender.tool.setTool

    return (
        <ToolBarContainer>
            <LeftBar>
                <SinkableButton
                    dataKey="brush"
                    onClick={() => setTool(ToolType.Brush)}
                    isDown={currentToolType === ToolType.Brush}
                >
                    🖌
                </SinkableButton>
                <SinkableButton
                    dataKey="erase"
                    onClick={() => setTool(ToolType.Eraser)}
                    isDown={currentToolType === ToolType.Eraser}
                >
                    🔥
                </SinkableButton>
                <SinkableButton
                    dataKey="zoom"
                    onClick={() => setTool(ToolType.Zoom)}
                    isDown={currentToolType === ToolType.Zoom}
                >
                    🔍
                </SinkableButton>
            </LeftBar>
            {props.transientState.isDetailsExpanded ? <BrushDetails {...props} /> : null}
        </ToolBarContainer>
    )
}

export interface ToolBarTransientState {
    readonly isDetailsExpanded: boolean
}

const Details = styled.div`
    display: flex;
    flex-direction: column;
    width: 12rem;
    padding: 0.5rem 0.75rem;
    border-left: 0.25rem solid ${p => p.theme.colorBg1.toStyle()};
`

export function BrushDetails(props: ToolBarProps): JSX.Element {
    const sender = props.messageSender.tool.brush
    const brush = props.tool.brush
    const color = brush.color

    return (
        <Details>
            <ColorWheel color={brush.color} onChange={sender.setColor} />
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
                        const rgb = Rgb.fromCss((text.target as any).value)
                        if (rgb === null) return

                        sender.setColor(rgbToHsv(rgb))
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
            <Labeled label="Hue" value={color.h.toFixed(2)}>
                <Slider percentage={color.h} onChange={pct => sender.setColor(color.withH(pct))} />
            </Labeled>
            <Labeled label="Saturation" value={color.s.toFixed(2)}>
                <Slider percentage={color.s} onChange={pct => sender.setColor(color.withS(pct))} />
            </Labeled>
            <Labeled label="Value" value={color.v.toFixed(2)}>
                <Slider percentage={color.v} onChange={pct => sender.setColor(color.withV(pct))} />
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
        </Details>
    )
}
