import * as Input from "../input"
import * as Brush from "./brush"
import * as Eraser from "./eraser"
import * as Camera from "./camera"
import * as BrushShader from "../rendering/brushShader"
import { Blend } from "../web-gl"
import { T2, Case, Action } from "../util"

export const enum ToolMsgType {
    SetTool,
    BrushMsg,
    EraserMsg,
    CameraMsg,
}

export type ToolMsg =
    | Action<ToolMsgType.SetTool, ToolType>
    | Action<ToolMsgType.BrushMsg, Brush.Msg>
    | Action<ToolMsgType.EraserMsg, Eraser.Msg>
    | Action<ToolMsgType.CameraMsg, Camera.Msg>

export interface MsgSender {
    readonly brush: Brush.MsgSender
    readonly eraser: Eraser.MsgSender
    readonly camera: Camera.MsgSender
    setTool(type: ToolType): void
}

export function createSender(sendMessage: (msg: ToolMsg) => void): MsgSender {
    return {
        brush: Brush.createBrushSender(msg =>
            sendMessage({ type: ToolMsgType.BrushMsg, payload: msg })
        ),
        eraser: Eraser.createBrushSender(msg =>
            sendMessage({ type: ToolMsgType.EraserMsg, payload: msg })
        ),
        camera: Camera.createSender(msg =>
            sendMessage({ type: ToolMsgType.CameraMsg, payload: msg })
        ),
        setTool: type => sendMessage({ type: ToolMsgType.SetTool, payload: type }),
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
        state: Brush.initTempState(),
    }
}

function eraserToolInit(): CurrentTool {
    return {
        type: ToolType.Eraser,
        state: Eraser.initTempState(),
    }
}

function moveToolInit(): CurrentTool {
    return {
        type: ToolType.Zoom,
        state: null,
    }
}

function zoomToolInit(): CurrentTool {
    return {
        type: ToolType.Zoom,
        state: null,
    }
}

function rotateToolInit(): CurrentTool {
    return {
        type: ToolType.Zoom,
        state: null,
    }
}

export function update(tool: Tool, msg: ToolMsg): Tool {
    switch (msg.type) {
        case ToolMsgType.SetTool: {
            switch (msg.payload) {
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
                    throw "unexpected tool type: " + msg.payload
            }
        }
        case ToolMsgType.BrushMsg:
            return { ...tool, brush: Brush.update(tool.brush, msg.payload) }
        case ToolMsgType.EraserMsg:
            return { ...tool, eraser: Eraser.update(tool.eraser, msg.payload) }
        case ToolMsgType.CameraMsg:
            return { ...tool, camera: Camera.update(tool.camera, msg.payload) }
    }
}

export function onClick(
    tool: Tool,
    pointer: Input.PointerInput
): T2<Tool, ReadonlyArray<BrushShader.BrushPoint>> {
    const { current } = tool
    switch (current.type) {
        case ToolType.Brush: {
            const [state, brushPoint] = Brush.onClick(tool.camera, tool.brush, pointer)
            return [{ ...tool, current: { type: ToolType.Brush, state } }, [brushPoint]]
        }
        case ToolType.Eraser: {
            const [state, brushPoint] = Eraser.onClick(tool.camera, tool.eraser, pointer)
            return [{ ...tool, current: { type: ToolType.Eraser, state } }, [brushPoint]]
        }
        case ToolType.Move: {
            if (current.state !== null) return [tool, []]

            const dragState: Input.DragState = { clickPoint: pointer, prevPoint: pointer }

            const cameraMsg = Camera.moveToolUpdate(tool.camera, dragState, pointer)
            const camera = Camera.update(tool.camera, cameraMsg)
            return [{ ...tool, camera, current: { type: ToolType.Move, state: dragState } }, []]
        }
        case ToolType.Zoom: {
            if (current.state !== null) return [tool, []]

            const dragState: Input.DragState = { clickPoint: pointer, prevPoint: pointer }

            const cameraMsg = Camera.zoomToolUpdate(tool.camera, dragState, pointer)
            const camera = Camera.update(tool.camera, cameraMsg)
            return [{ ...tool, camera, current: { type: ToolType.Zoom, state: dragState } }, []]
        }
        case ToolType.Rotate: {
            if (current.state !== null) return [tool, []]

            const dragState: Input.DragState = { clickPoint: pointer, prevPoint: pointer }

            const cameraMsg = Camera.rotateToolUpdate(tool.camera, dragState, pointer)
            const camera = Camera.update(tool.camera, cameraMsg)
            return [{ ...tool, camera, current: { type: ToolType.Rotate, state: dragState } }, []]
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
            const [state, brushPoints] = Brush.onDrag(
                tool.camera,
                tool.brush,
                current.state,
                pointer
            )
            return [{ ...tool, current: { type: ToolType.Brush, state } }, brushPoints]
        }
        case ToolType.Eraser: {
            const [state, brushPoints] = Eraser.onDrag(
                tool.camera,
                tool.eraser,
                current.state,
                pointer
            )
            return [{ ...tool, current: { type: ToolType.Eraser, state } }, brushPoints]
        }
        case ToolType.Move: {
            if (current.state === null) return [tool, []]

            const cameraMsg = Camera.moveToolUpdate(tool.camera, current.state, pointer)
            const camera = Camera.update(tool.camera, cameraMsg)
            const dragState: Input.DragState = {
                clickPoint: current.state.clickPoint,
                prevPoint: pointer,
            }
            return [{ ...tool, camera, current: { type: ToolType.Move, state: dragState } }, []]
        }
        case ToolType.Zoom: {
            if (current.state === null) return [tool, []]

            const cameraMsg = Camera.zoomToolUpdate(tool.camera, current.state, pointer)
            const camera = Camera.update(tool.camera, cameraMsg)
            const dragState: Input.DragState = {
                clickPoint: current.state.clickPoint,
                prevPoint: pointer,
            }
            return [{ ...tool, camera, current: { type: ToolType.Zoom, state: dragState } }, []]
        }
        case ToolType.Rotate: {
            if (current.state === null) return [tool, []]

            const cameraMsg = Camera.rotateToolUpdate(tool.camera, current.state, pointer)
            const camera = Camera.update(tool.camera, cameraMsg)
            const dragState: Input.DragState = {
                clickPoint: current.state.clickPoint,
                prevPoint: pointer,
            }
            return [{ ...tool, camera, current: { type: ToolType.Rotate, state: dragState } }, []]
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
            const [state, brushPoints] = Brush.onRelease(
                tool.camera,
                tool.brush,
                current.state,
                pointer
            )
            return [{ ...tool, current: { type: ToolType.Brush, state } }, brushPoints]
        }
        case ToolType.Eraser: {
            const [state, brushPoints] = Eraser.onRelease(
                tool.camera,
                tool.eraser,
                current.state,
                pointer
            )
            return [{ ...tool, current: { type: ToolType.Eraser, state } }, brushPoints]
        }
        case ToolType.Move: {
            if (current.state === null) return [tool, []]
            const cameraMsg = Camera.moveToolUpdate(tool.camera, current.state, pointer)
            const camera = Camera.update(tool.camera, cameraMsg)
            return [{ ...tool, camera, current: { type: ToolType.Move, state: null } }, []]
        }
        case ToolType.Zoom: {
            if (current.state === null) return [tool, []]
            const cameraMsg = Camera.zoomToolUpdate(tool.camera, current.state, pointer)
            const camera = Camera.update(tool.camera, cameraMsg)
            return [{ ...tool, camera, current: { type: ToolType.Zoom, state: null } }, []]
        }
        case ToolType.Rotate: {
            if (current.state === null) return [tool, []]
            const cameraMsg = Camera.rotateToolUpdate(tool.camera, current.state, pointer)
            const camera = Camera.update(tool.camera, cameraMsg)
            return [{ ...tool, camera, current: { type: ToolType.Rotate, state: null } }, []]
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
            const [state, brushPoints] = Brush.onFrame(tool.brush, current.state, currentTime)
            if (state === current.state && brushPoints.length === 0) {
                return [tool, brushPoints]
            } else {
                return [{ ...tool, current: { type: ToolType.Brush, state } }, brushPoints]
            }
        }
        case ToolType.Eraser: {
            const [state, brushPoints] = Eraser.onFrame(tool.eraser, current.state, currentTime)
            if (state === current.state && brushPoints.length === 0) {
                return [tool, brushPoints]
            } else {
                return [{ ...tool, current: { type: ToolType.Eraser, state } }, brushPoints]
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
