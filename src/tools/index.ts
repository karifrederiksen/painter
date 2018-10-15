import * as Input from "../input"
import * as Brush from "./brush"
import * as Eraser from "./eraser"
import * as Camera from "./camera"
import * as BrushShader from "../canvas/brushShader"
import { Blend } from "../webgl"
import { T2, Case } from "../util"

export const enum ToolMsgType {
    SetTool,
    BrushMsg,
    EraserMsg,
    CameraMsg,
}

export type ToolMsg =
    | Case<ToolMsgType.SetTool, ToolType>
    | Case<ToolMsgType.BrushMsg, Brush.Msg>
    | Case<ToolMsgType.EraserMsg, Eraser.Msg>
    | Case<ToolMsgType.CameraMsg, Camera.Msg>

export interface MsgSender {
    readonly brush: Brush.MsgSender
    readonly eraser: Eraser.MsgSender
    readonly camera: Camera.MsgSender
    setTool(type: ToolType): void
}

export function createSender(sendMessage: (msg: ToolMsg) => void): MsgSender {
    return {
        brush: Brush.createBrushSender(msg =>
            sendMessage({ type: ToolMsgType.BrushMsg, value: msg })
        ),
        eraser: Eraser.createBrushSender(msg =>
            sendMessage({ type: ToolMsgType.EraserMsg, value: msg })
        ),
        camera: Camera.createSender(msg =>
            sendMessage({ type: ToolMsgType.CameraMsg, value: msg })
        ),
        setTool: type => sendMessage({ type: ToolMsgType.SetTool, value: type }),
    }
}

export const enum ToolType {
    Brush,
    Eraser,
    Move,
    Zoom,
    Rotate,
}

export interface Tool {
    readonly brush: Brush.State
    readonly eraser: Eraser.State
    readonly camera: Camera.State
    readonly current: CurrentTool
}

export type CurrentTool =
    | Case<ToolType.Brush, Brush.TempState>
    | Case<ToolType.Eraser, Eraser.TempState>
    | Case<ToolType.Move, Input.DragState | null>
    | Case<ToolType.Zoom, Input.DragState | null>
    | Case<ToolType.Rotate, Input.DragState | null>

export function init(): Tool {
    return {
        brush: Brush.init(),
        eraser: Eraser.init(),
        camera: Camera.init(),
        current: brushToolInit(),
    }
}

function brushToolInit(): CurrentTool {
    return {
        type: ToolType.Brush,
        value: Brush.initTempState(),
    }
}

function eraserToolInit(): CurrentTool {
    return {
        type: ToolType.Eraser,
        value: Eraser.initTempState(),
    }
}

function moveToolInit(): CurrentTool {
    return {
        type: ToolType.Zoom,
        value: null,
    }
}

function zoomToolInit(): CurrentTool {
    return {
        type: ToolType.Zoom,
        value: null,
    }
}

function rotateToolInit(): CurrentTool {
    return {
        type: ToolType.Zoom,
        value: null,
    }
}

export function update(tool: Tool, msg: ToolMsg): Tool {
    switch (msg.type) {
        case ToolMsgType.SetTool: {
            switch (msg.value) {
                case ToolType.Brush:
                    return { ...tool, current: brushToolInit() }
                case ToolType.Eraser:
                    return { ...tool, current: eraserToolInit() }
                case ToolType.Move:
                    return { ...tool, current: moveToolInit() }
                case ToolType.Zoom:
                    return { ...tool, current: zoomToolInit() }
                case ToolType.Rotate:
                    return { ...tool, current: rotateToolInit() }
                default:
                    throw "unexpected tool type: " + msg.value
            }
        }
        case ToolMsgType.BrushMsg:
            return { ...tool, brush: Brush.update(tool.brush, msg.value) }
        case ToolMsgType.EraserMsg:
            return { ...tool, eraser: Eraser.update(tool.eraser, msg.value) }
        case ToolMsgType.CameraMsg:
            return { ...tool, camera: Camera.update(tool.camera, msg.value) }
    }
}

export function onClick(
    tool: Tool,
    pointer: Input.PointerInput
): T2<Tool, ReadonlyArray<BrushShader.BrushPoint>> {
    const { current } = tool
    switch (current.type) {
        case ToolType.Brush: {
            const [value, brushPoint] = Brush.onClick(tool.camera, tool.brush, pointer)
            return [{ ...tool, current: { type: ToolType.Brush, value } }, [brushPoint]]
        }
        case ToolType.Eraser: {
            const [value, brushPoint] = Eraser.onClick(tool.camera, tool.eraser, pointer)
            return [{ ...tool, current: { type: ToolType.Eraser, value } }, [brushPoint]]
        }
        case ToolType.Move: {
            if (current.value !== null) return [tool, []]

            const dragState: Input.DragState = { clickPoint: pointer, prevPoint: pointer }

            const cameraMsg = Camera.moveToolUpdate(tool.camera, dragState, pointer)
            const camera = Camera.update(tool.camera, cameraMsg)
            return [{ ...tool, camera, current: { type: ToolType.Move, value: dragState } }, []]
        }
        case ToolType.Zoom: {
            if (current.value !== null) return [tool, []]

            const dragState: Input.DragState = { clickPoint: pointer, prevPoint: pointer }

            const cameraMsg = Camera.zoomToolUpdate(tool.camera, dragState, pointer)
            const camera = Camera.update(tool.camera, cameraMsg)
            return [{ ...tool, camera, current: { type: ToolType.Zoom, value: dragState } }, []]
        }
        case ToolType.Rotate: {
            if (current.value !== null) return [tool, []]

            const dragState: Input.DragState = { clickPoint: pointer, prevPoint: pointer }

            const cameraMsg = Camera.rotateToolUpdate(tool.camera, dragState, pointer)
            const camera = Camera.update(tool.camera, cameraMsg)
            return [{ ...tool, camera, current: { type: ToolType.Rotate, value: dragState } }, []]
        }
    }
}

export function onDrag(
    tool: Tool,
    pointer: Input.PointerInput
): T2<Tool, ReadonlyArray<BrushShader.BrushPoint>> {
    const { current } = tool
    switch (current.type) {
        case ToolType.Brush: {
            const [value, brushPoints] = Brush.onDrag(
                tool.camera,
                tool.brush,
                current.value,
                pointer
            )
            return [{ ...tool, current: { type: ToolType.Brush, value } }, brushPoints]
        }
        case ToolType.Eraser: {
            const [value, brushPoints] = Eraser.onDrag(
                tool.camera,
                tool.eraser,
                current.value,
                pointer
            )
            return [{ ...tool, current: { type: ToolType.Eraser, value } }, brushPoints]
        }
        case ToolType.Move: {
            if (current.value === null) return [tool, []]

            const cameraMsg = Camera.moveToolUpdate(tool.camera, current.value, pointer)
            const camera = Camera.update(tool.camera, cameraMsg)
            const dragState: Input.DragState = {
                clickPoint: current.value.clickPoint,
                prevPoint: pointer,
            }
            return [{ ...tool, camera, current: { type: ToolType.Move, value: dragState } }, []]
        }
        case ToolType.Zoom: {
            if (current.value === null) return [tool, []]

            const cameraMsg = Camera.zoomToolUpdate(tool.camera, current.value, pointer)
            const camera = Camera.update(tool.camera, cameraMsg)
            const dragState: Input.DragState = {
                clickPoint: current.value.clickPoint,
                prevPoint: pointer,
            }
            return [{ ...tool, camera, current: { type: ToolType.Zoom, value: dragState } }, []]
        }
        case ToolType.Rotate: {
            if (current.value === null) return [tool, []]

            const cameraMsg = Camera.rotateToolUpdate(tool.camera, current.value, pointer)
            const camera = Camera.update(tool.camera, cameraMsg)
            const dragState: Input.DragState = {
                clickPoint: current.value.clickPoint,
                prevPoint: pointer,
            }
            return [{ ...tool, camera, current: { type: ToolType.Rotate, value: dragState } }, []]
        }
    }
}

export function onRelease(
    tool: Tool,
    pointer: Input.PointerInput
): T2<Tool, ReadonlyArray<BrushShader.BrushPoint>> {
    const { current } = tool
    switch (current.type) {
        case ToolType.Brush: {
            const [value, brushPoints] = Brush.onRelease(
                tool.camera,
                tool.brush,
                current.value,
                pointer
            )
            return [{ ...tool, current: { type: ToolType.Brush, value } }, brushPoints]
        }
        case ToolType.Eraser: {
            const [value, brushPoints] = Eraser.onRelease(
                tool.camera,
                tool.eraser,
                current.value,
                pointer
            )
            return [{ ...tool, current: { type: ToolType.Eraser, value } }, brushPoints]
        }
        case ToolType.Move: {
            if (current.value === null) return [tool, []]
            const cameraMsg = Camera.moveToolUpdate(tool.camera, current.value, pointer)
            const camera = Camera.update(tool.camera, cameraMsg)
            return [{ ...tool, camera, current: { type: ToolType.Move, value: null } }, []]
        }
        case ToolType.Zoom: {
            if (current.value === null) return [tool, []]
            const cameraMsg = Camera.zoomToolUpdate(tool.camera, current.value, pointer)
            const camera = Camera.update(tool.camera, cameraMsg)
            return [{ ...tool, camera, current: { type: ToolType.Zoom, value: null } }, []]
        }
        case ToolType.Rotate: {
            if (current.value === null) return [tool, []]
            const cameraMsg = Camera.rotateToolUpdate(tool.camera, current.value, pointer)
            const camera = Camera.update(tool.camera, cameraMsg)
            return [{ ...tool, camera, current: { type: ToolType.Rotate, value: null } }, []]
        }
    }
}

export function onFrame(
    tool: Tool,
    currentTime: number
): T2<Tool, ReadonlyArray<BrushShader.BrushPoint>> {
    const { current } = tool
    switch (current.type) {
        case ToolType.Brush: {
            const [value, brushPoints] = Brush.onFrame(tool.brush, current.value, currentTime)
            if (value === current.value && brushPoints.length === 0) {
                return [tool, brushPoints]
            } else {
                return [{ ...tool, current: { type: ToolType.Brush, value } }, brushPoints]
            }
        }
        case ToolType.Eraser: {
            const [value, brushPoints] = Eraser.onFrame(tool.eraser, current.value, currentTime)
            if (value === current.value && brushPoints.length === 0) {
                return [tool, brushPoints]
            } else {
                return [{ ...tool, current: { type: ToolType.Eraser, value } }, brushPoints]
            }
        }
        default:
            return [tool, []]
    }
}

export function getBlendMode(tool: CurrentTool): Blend.Mode {
    switch (tool.type) {
        case ToolType.Brush:
            return Blend.Mode.Normal
        case ToolType.Eraser:
            return Blend.Mode.Erase
        default:
            console.warn(
                "Getting BlendMode for type " + tool.type + ", which is neithre a Brush or Eraser"
            )
            return Blend.Mode.Normal
    }
}

export function getSoftness(tool: Tool): number {
    switch (tool.current.type) {
        case ToolType.Brush:
            return tool.brush.softness
        case ToolType.Eraser:
            return tool.eraser.softness
        default:
            console.warn(
                "Getting BlendMode for type " +
                    tool.current.type +
                    ", which is neithre a Brush or Eraser"
            )
            return 0
    }
}
