import * as React from "react"

import styled from "../styled"
import * as Tools from "../tools"
import * as Brush from "../tools/brush"
import * as Eraser from "../tools/eraser"
import { SinkableButton } from "../components/buttons"
import { SurfaceLook } from "../components/surface"

export interface ToolbarProps {
    readonly msgSender: Tools.MsgSender
    readonly tool: Tools.Tool
    readonly transientState: TransientState
}

const LeftBar = styled(SurfaceLook)`
    display: flex;
    flex-direction: column;
    padding-top: 1rem;
    margin-right: 0.5rem;

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
                (() => {
                    switch (currentToolType) {
                        case Tools.ToolType.Brush:
                            return (
                                <Brush.Details
                                    messageSender={props.msgSender.brush}
                                    tool={props.tool.brush}
                                />
                            )
                        case Tools.ToolType.Eraser:
                            return (
                                <Eraser.Details
                                    messageSender={props.msgSender.eraser}
                                    tool={props.tool.eraser}
                                />
                            )
                        default:
                            return <></>
                    }
                })()
            ) : (
                <></>
            )}
        </ToolBarContainer>
    )
}

export interface TransientState {
    readonly isDetailsExpanded: boolean
}
