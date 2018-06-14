import { createElement } from "inferno-create-element"
import { css } from "emotion"
import { Tool, CanvasMsg, toolMessage } from "../canvas"
import { BrushMsg } from "../canvas/tools/brushtool"
import { ToolMsg, ToolType } from "../canvas/tools"
import * as toolMsgs from "../canvas/tools/messages"
import { SinkableButton } from "./views/buttons"
import { PrimaryButton } from "./views/buttons/filledButton"

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
            {props.transientState.isDetailsExpanded ? <ToolBarDetails {...props} /> : null}
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
    padding: 0.5rem;
    border-left: 0.25rem solid rgba(0, 0, 0, 0.4);
`

export function ToolBarDetails(props: ToolBarProps): JSX.Element {
    function trigger(msg: ToolMsg) {
        return () => props.sendMessage(toolMessage(msg))
    }

    return (
        <div className={Details}>
            <p>hey</p>
            <PrimaryButton>Click?</PrimaryButton>
        </div>
    )
}
