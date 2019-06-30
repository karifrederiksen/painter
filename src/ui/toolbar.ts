import { Op, _, memo, shallowEqual } from "ivi"
import { div, span } from "ivi-html"

import * as Tools from "../tools"
import * as Brush from "./brush"
import * as Eraser from "./eraser"
import { SinkableButton } from "./views/buttons"
import { surfaceLook } from "./views/surface"
import * as Icons from "./views/icons"
import * as styles from "./toolbar.scss"

export interface TransientState {
    readonly isDetailsExpanded: boolean
}

export interface ToolbarProps {
    readonly msgSender: Tools.MsgSender
    readonly tool: Tools.Tool
    readonly transientState: TransientState
}

export const Toolbar = memo((props: ToolbarProps): Op => {
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
