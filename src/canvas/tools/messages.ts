import { Msg } from "../../data/types"
import { CameraMsg } from "./cameratools"
import { BrushMsg } from "./brushtool"
import { ToolType } from "."

export const enum ToolMsgType {
    SetTool,
    BrushMsg,
    EraserMsg,
    MoveMsg,
    ZoomMsg,
    RotateMsg,
}

export type ToolMsg =
    | Msg<ToolMsgType.SetTool, ToolType>
    | Msg<ToolMsgType.BrushMsg, BrushMsg>
    | Msg<ToolMsgType.EraserMsg, BrushMsg>
    | Msg<ToolMsgType.MoveMsg, CameraMsg>
    | Msg<ToolMsgType.ZoomMsg, CameraMsg>
    | Msg<ToolMsgType.RotateMsg, CameraMsg>

export function setTool(type: ToolType): ToolMsg {
    return { type: ToolMsgType.SetTool, payload: type }
}

export function brushMessage(msg: BrushMsg): ToolMsg {
    return { type: ToolMsgType.BrushMsg, payload: msg }
}
export const eraserMessage = brushMessage

export function moveMessage(msg: CameraMsg): ToolMsg {
    return { type: ToolMsgType.MoveMsg, payload: msg }
}
export const zoomMessage = moveMessage
export const rotateMessage = moveMessage
