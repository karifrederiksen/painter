import { css } from "emotion"
import { Tool, MessageSender } from "../canvas"
import { ToolType } from "../canvas/tools"
import { SinkableButton } from "./views/buttons"
import { Labeled } from "./views/labeled"
import { Slider } from "./views/slider"
import { Switch } from "./views/switch"
import { InlineLabeled } from "./views/inlineLabeled"
import { ColorDisplay } from "./views/colorDisplay"
import { YPadded } from "./views/padded"
import { ColorWheel } from "./views/colorWheel"

export interface ToolBarProps {
    readonly messageSender: MessageSender
    readonly tool: Tool
    readonly transientState: ToolBarTransientState
}

const LeftBar = css`
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

const ToolBarContainer = css`
    display: flex;
    background-color: var(--color-bg-level-0);
    color: var(--color-text-light);
`

export function ToolBar(props: ToolBarProps): JSX.Element {
    const currentToolType = props.tool.current.type
    const setTool = props.messageSender.tool.setTool

    return (
        <div className={ToolBarContainer}>
            <div className={LeftBar}>
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
            </div>
            {props.transientState.isDetailsExpanded ? <BrushDetails {...props} /> : null}
        </div>
    )
}

export interface ToolBarTransientState {
    readonly isDetailsExpanded: boolean
}

const Details = css`
    display: flex;
    flex-direction: column;
    width: 12rem;
    padding: 0.5rem 0.75rem;
    border-left: 0.25rem solid rgba(0, 0, 0, 0.4);
`

export function BrushDetails(props: ToolBarProps): JSX.Element {
    const sender = props.messageSender.tool.brush
    const brush = props.tool.brush
    const color = brush.color

    return (
        <div className={Details}>
            <ColorWheel color={brush.color} onChange={sender.setColor} />
            <YPadded y={0.5}>
                <ColorDisplay
                    color={brush.color}
                    colorSecondary={brush.colorSecondary}
                    onClick={() => sender.swapColorFrom(brush.color)}
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
                <Slider
                    percentage={color.h}
                    onChange={pct => sender.setColor(color.with({ h: pct }))}
                />
            </Labeled>
            <Labeled label="Saturation" value={color.s.toFixed(2)}>
                <Slider
                    percentage={color.s}
                    onChange={pct => sender.setColor(color.with({ s: pct }))}
                />
            </Labeled>
            <Labeled label="Value" value={color.v.toFixed(2)}>
                <Slider
                    percentage={color.v}
                    onChange={pct => sender.setColor(color.with({ v: pct }))}
                />
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
        </div>
    )
}
