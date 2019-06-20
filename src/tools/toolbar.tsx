import * as React from "react"

import * as Tools from "."
import * as Brush from "./brush"
import * as Eraser from "./eraser"
import { SinkableButton } from "../views/buttons"
import { surfaceLook } from "../views/surface"
import * as styles from "./toolbar.scss"

export interface ToolbarProps {
    readonly msgSender: Tools.MsgSender
    readonly tool: Tools.Tool
    readonly transientState: TransientState
}

export function View(props: ToolbarProps): JSX.Element {
    const currentToolType = props.tool.current
    const setTool = props.msgSender.setTool

    return (
        <div className={styles.toolBarContainer}>
            <div className={surfaceLook + " " + styles.leftBar}>
                <SinkableButton
                    onClick={() => setTool(Tools.ToolType.Brush)}
                    isDown={currentToolType === Tools.ToolType.Brush}
                >
                    🖌
                </SinkableButton>
                <SinkableButton
                    onClick={() => setTool(Tools.ToolType.Eraser)}
                    isDown={currentToolType === Tools.ToolType.Eraser}
                >
                    🔥
                </SinkableButton>
                <SinkableButton
                    onClick={() => setTool(Tools.ToolType.Zoom)}
                    isDown={currentToolType === Tools.ToolType.Zoom}
                >
                    🔍
                </SinkableButton>
            </div>
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
        </div>
    )
}

export interface TransientState {
    readonly isDetailsExpanded: boolean
}
