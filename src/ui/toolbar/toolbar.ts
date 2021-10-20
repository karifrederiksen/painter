import { _, shallowEqual, statelessComponent } from "ivi"
import { div } from "ivi-html"

import * as Tools from "../../tools"
import * as Brush from "../brush"
import * as Eraser from "../eraser"
import { SinkableButton, surfaceLook, Icons } from "../components"
import * as styles from "./toolbar.scss"

export interface TransientState {
    readonly isDetailsExpanded: boolean
}

export interface ToolbarProps {
    readonly sender: Tools.Sender
    readonly tool: Tools.Config
    readonly transientState: TransientState
}

export const Toolbar = statelessComponent<ToolbarProps>((props) => {
    const currentToolType = props.tool.current
    const setTool = props.sender.setTool

    return div(styles.toolBarContainer, { style: { "z-index": 1 } }, [
        div(surfaceLook + " " + styles.leftBar, _, [
            SinkableButton({
                isDown: currentToolType === "Brush",
                onClick: () => setTool("Brush"),
                children: Icons.brush24px,
            }),
            SinkableButton({
                isDown: currentToolType === "Eraser",
                onClick: () => setTool("Eraser"),
                children: Icons.edit24px,
            }),
            SinkableButton({
                isDown: currentToolType === "Zoom",
                onClick: () => setTool("Zoom"),
                children: Icons.search24px,
            }),
        ]),
        !props.transientState.isDetailsExpanded
            ? null
            : (() => {
                  switch (currentToolType) {
                      case "Brush":
                          return Brush.Details({
                              sender: props.sender.brush,
                              tool: props.tool.brush,
                          })
                      case "Eraser":
                          return Eraser.Details({
                              sender: props.sender.eraser,
                              tool: props.tool.eraser,
                          })
                      default:
                          return null
                  }
              })(),
    ])
}, shallowEqual)
