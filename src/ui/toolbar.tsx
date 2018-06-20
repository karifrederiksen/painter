import { css } from "emotion"
import { Tool, CanvasMsg, toolMessage } from "../canvas"
import { BrushMsg } from "../canvas/tools/brushtool"
import { ToolMsg, ToolType } from "../canvas/tools"
import * as toolMsgs from "../canvas/tools/messages"
import { SinkableButton } from "./views/buttons"
import { PrimaryButton } from "./views/buttons/filledButton"
import { Labeled } from "./views/labeled"
import { Slider } from "./views/slider"
import {
    setOpacity,
    setColor,
    setPressureAffectsOpacity,
    setPressureAffectsSize,
    swapColorFrom,
} from "../canvas/tools/brushtool/messages"
import { Switch } from "./views/switch"
import { InlineLabeled } from "./views/inlineLabeled"
import { ColorDisplay } from "./views/colorDisplay"
import { brushMessage } from "../canvas/tools/messages"
import { Padded } from "./views/padded"
import { ColorWheel } from "./views/colorWheel"

export interface ToolBarProps {
    readonly sendMessage: (message: CanvasMsg) => void
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
    function trigger(msg: ToolMsg) {
        return () => props.sendMessage(toolMessage(msg))
    }

    const currentToolType = props.tool.current.type

    return (
        <div className={ToolBarContainer}>
            <div className={LeftBar}>
                <SinkableButton
                    dataKey="brush"
                    onClick={trigger(toolMsgs.setTool(ToolType.Brush))}
                    isDown={currentToolType === ToolType.Brush}
                >
                    🖌
                </SinkableButton>
                <SinkableButton
                    dataKey="erase"
                    onClick={trigger(toolMsgs.setTool(ToolType.Eraser))}
                    isDown={currentToolType === ToolType.Eraser}
                >
                    🔥
                </SinkableButton>
                <SinkableButton
                    dataKey="zoom"
                    onClick={trigger(toolMsgs.setTool(ToolType.Zoom))}
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
    function trigger(msg: BrushMsg) {
        return props.sendMessage(toolMessage(brushMessage(msg)))
    }

    const brush = props.tool.brush
    const color = brush.color

    return (
        <div className={Details}>
            <ColorWheel color={brush.color} />
            <Labeled label="hey">
                <PrimaryButton>Click?</PrimaryButton>
            </Labeled>
            <Labeled label="Flow" value={brush.flowPct.toFixed(2)}>
                <Slider percentage={brush.flowPct} onChange={pct => trigger(setOpacity(pct))} />
            </Labeled>
            <Labeled label="Hue" value={color.h.toFixed(2)}>
                <Slider
                    percentage={color.h}
                    onChange={pct => trigger(setColor(color.with({ h: pct })))}
                />
            </Labeled>
            <Labeled label="Saturation" value={color.s.toFixed(2)}>
                <Slider
                    percentage={color.s}
                    onChange={pct => trigger(setColor(color.with({ s: pct })))}
                />
            </Labeled>
            <Labeled label="Value" value={color.v.toFixed(2)}>
                <Slider
                    percentage={color.v}
                    onChange={pct => trigger(setColor(color.with({ v: pct })))}
                />
            </Labeled>
            <InlineLabeled label="Pressure-Opacity">
                <Switch
                    checked={brush.pressureAffectsOpacity}
                    onCheck={checked => trigger(setPressureAffectsOpacity(checked))}
                />
            </InlineLabeled>
            <InlineLabeled label="Pressure-Size">
                <Switch
                    checked={brush.pressureAffectsSize}
                    onCheck={checked => trigger(setPressureAffectsSize(checked))}
                />
            </InlineLabeled>
            <Padded paddingX={0} paddingY={0.5}>
                <ColorDisplay
                    color={brush.color}
                    colorSecondary={brush.colorSecondary}
                    onClick={() => trigger(swapColorFrom(brush.color))}
                />
            </Padded>
        </div>
    )
}
