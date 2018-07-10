import { Msg } from "core"
import { CameraMsg, CameraMessageSender, createCameraSender } from "./cameratools"
import { ToolType } from "."
import { BrushMsg, BrushMessageSender, createBrushSender } from "./brushtool/messages"

export const enum ToolMsgType {
    SetTool,
    BrushMsg,
    EraserMsg,
    CameraMsg,
}

export type ToolMsg =
    | Msg<ToolMsgType.SetTool, ToolType>
    | Msg<ToolMsgType.BrushMsg, BrushMsg>
    | Msg<ToolMsgType.EraserMsg, BrushMsg>
    | Msg<ToolMsgType.CameraMsg, CameraMsg>

export interface ToolMessageSender {
    readonly brush: BrushMessageSender
    readonly camera: CameraMessageSender
    setTool(type: ToolType): void
}

export function createToolSender(sendMessage: (msg: ToolMsg) => void): ToolMessageSender {
    return {
        brush: createBrushSender(msg => sendMessage({ type: ToolMsgType.BrushMsg, payload: msg })),
        camera: createCameraSender(msg =>
            sendMessage({ type: ToolMsgType.CameraMsg, payload: msg })
        ),
        setTool: type => sendMessage({ type: ToolMsgType.SetTool, payload: type }),
    }
}
