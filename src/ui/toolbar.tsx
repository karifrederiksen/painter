import * as React from "react"
import styled from "styled-components"
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
    background-color: var(--color-bg-level-0);
    color: var(--color-text-light);
`

export class ToolBar extends React.PureComponent<ToolBarProps> {
    render(): JSX.Element {
        const props = this.props
        const currentToolType = props.tool.current.type

        return (
            <ToolBarContainer>
                <LeftBar>
                    <SinkableButton
                        dataKey="brush"
                        onClick={this.trigger(toolMsgs.setTool(ToolType.Brush))}
                        isDown={currentToolType === ToolType.Brush}
                    >
                        🖌
                    </SinkableButton>
                    <SinkableButton
                        dataKey="erase"
                        onClick={this.trigger(toolMsgs.setTool(ToolType.Eraser))}
                        isDown={currentToolType === ToolType.Eraser}
                    >
                        🔥
                    </SinkableButton>
                    <SinkableButton
                        dataKey="zoom"
                        onClick={this.trigger(toolMsgs.setTool(ToolType.Zoom))}
                        isDown={currentToolType === ToolType.Zoom}
                    >
                        🔍
                    </SinkableButton>
                </LeftBar>
                {props.transientState.isDetailsExpanded ? <ToolBarDetails {...props} /> : null}
            </ToolBarContainer>
        )
    }

    private trigger(msg: ToolMsg) {
        return () => this.props.sendMessage(toolMessage(msg))
    }
}

export interface ToolBarTransientState {
    readonly isDetailsExpanded: boolean
}

const Details = styled.div`
    display: flex;
    flex-direction: column;
    width: 12rem;
    padding: 0.5rem;
    border-left: 0.25rem solid rgba(0, 0, 0, 0.4);
`

export class ToolBarDetails extends React.PureComponent<ToolBarProps> {
    render(): JSX.Element {
        return (
            <Details>
                <p>hey</p>
                <PrimaryButton>Click?</PrimaryButton>
            </Details>
        )
    }

    private trigger(msg: ToolMsg) {
        return () => this.props.sendMessage(toolMessage(msg))
    }
}
