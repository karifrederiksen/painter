import { _, shallowEqual, statelessComponent } from "ivi"
import { div } from "ivi-html"

import * as Tools from "../tools"
import * as Brush from "./brush"
import * as Eraser from "./eraser"
import { SinkableButton, surfaceLook, Icons } from "./views"
import * as styles from "./toolbar.scss"

export interface TransientState {
    readonly isDetailsExpanded: boolean
}

export interface ToolbarProps {
    readonly msgSender: Tools.MsgSender
    readonly tool: Tools.Config
    readonly transientState: TransientState
}

export const Toolbar = statelessComponent<ToolbarProps>(props => {
    const currentToolType = props.tool.current
    const setTool = props.msgSender.setTool

    return div(styles.toolBarContainer, { style: { "z-index": 1 } }, [
        div(surfaceLook + " " + styles.leftBar, _, [
            SinkableButton({
                isDown: currentToolType === Tools.ToolType.Brush,
                onClick: () => setTool(Tools.ToolType.Brush),
                children: Icons.brush24px,
            }),
            SinkableButton({
                isDown: currentToolType === Tools.ToolType.Eraser,
                onClick: () => setTool(Tools.ToolType.Eraser),
                children: Icons.edit24px,
            }),
            SinkableButton({
                isDown: currentToolType === Tools.ToolType.Zoom,
                onClick: () => setTool(Tools.ToolType.Zoom),
                children: Icons.search24px,
            }),
        ]),
        !props.transientState.isDetailsExpanded
            ? null
            : (() => {
                  switch (currentToolType) {
                      case Tools.ToolType.Brush:
                          return Brush.Details({
                              messageSender: props.msgSender.brush,
                              tool: props.tool.brush,
                          })
                      case Tools.ToolType.Eraser:
                          return Eraser.Details({
                              messageSender: props.msgSender.eraser,
                              tool: props.tool.eraser,
                          })
                      default:
                          return null
                  }
              })(),
    ])
}, shallowEqual)
