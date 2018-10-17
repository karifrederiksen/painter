import * as Input from "../input"
import * as Brush from "./brush"
import * as Eraser from "./eraser"
import * as Camera from "./camera"
import * as BrushShader from "../canvas/brushShader"
import { Blend } from "../webgl"
import { T2, Case, T3 } from "../util"

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
    readonly current: ToolType
}

export type EphemeralState =
    | Case<ToolType.Brush, Brush.EphemeralState>
    | Case<ToolType.Eraser, Eraser.EphemeralState>
    | Case<ToolType.Move, Input.DragState | null>
    | Case<ToolType.Zoom, Input.DragState | null>
    | Case<ToolType.Rotate, Input.DragState | null>

export function init(): Tool {
    return {
        brush: Brush.init(),
        eraser: Eraser.init(),
        camera: Camera.init(),
        current: ToolType.Brush,
    }
}

export function initEphemeral(): EphemeralState {
    return brushToolInit()
}

function brushToolInit(): EphemeralState {
    return {
        type: ToolType.Brush,
        value: Brush.initTempState(),
    }
}

function eraserToolInit(): EphemeralState {
    return {
        type: ToolType.Eraser,
        value: Eraser.initTempState(),
    }
}

function moveToolInit(): EphemeralState {
    return {
        type: ToolType.Zoom,
        value: null,
    }
}

function zoomToolInit(): EphemeralState {
    return {
        type: ToolType.Zoom,
        value: null,
    }
}

function rotateToolInit(): EphemeralState {
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
                    return { ...tool, current: ToolType.Brush }
                case ToolType.Eraser:
                    return { ...tool, current: ToolType.Eraser }
                case ToolType.Move:
                    return { ...tool, current: ToolType.Move }
                case ToolType.Zoom:
                    return { ...tool, current: ToolType.Zoom }
                case ToolType.Rotate:
                    return { ...tool, current: ToolType.Rotate }
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

function syncEphemeral(tool: Tool, ephemeral: EphemeralState): EphemeralState {
    if (ephemeral.type === tool.current) {
        return ephemeral
    } else {
        switch (tool.current) {
            case ToolType.Brush:
                return brushToolInit()
            case ToolType.Eraser:
                return eraserToolInit()
            case ToolType.Move:
                return moveToolInit()
            case ToolType.Rotate:
                return rotateToolInit()
            case ToolType.Zoom:
                return zoomToolInit()
            default:
                throw "Unknown tool type: " + tool.current
        }
    }
}

export function onClick(
    tool: Tool,
    ephemeral_: EphemeralState,
    pointer: Input.PointerInput
): T3<Tool, EphemeralState, ReadonlyArray<BrushShader.BrushPoint>> {
    const ephemeral = syncEphemeral(tool, ephemeral_)

    switch (ephemeral.type) {
        case ToolType.Brush: {
            const [value, brushPoint] = Brush.onClick(tool.camera, tool.brush, pointer)
            return [tool, { type: ToolType.Brush, value }, [brushPoint]]
        }
        case ToolType.Eraser: {
            const [value, brushPoint] = Eraser.onClick(tool.camera, tool.eraser, pointer)
            return [tool, { type: ToolType.Eraser, value }, [brushPoint]]
        }
        case ToolType.Move: {
            if (ephemeral.value !== null) return [tool, ephemeral, []]

            const dragState: Input.DragState = { clickPoint: pointer, prevPoint: pointer }

            const cameraMsg = Camera.moveToolUpdate(tool.camera, dragState, pointer)
            const camera = Camera.update(tool.camera, cameraMsg)
            return [{ ...tool, camera }, { type: ToolType.Move, value: dragState }, []]
        }
        case ToolType.Zoom: {
            if (ephemeral.value !== null) return [tool, ephemeral, []]

            const dragState: Input.DragState = { clickPoint: pointer, prevPoint: pointer }

            const cameraMsg = Camera.zoomToolUpdate(tool.camera, dragState, pointer)
            const camera = Camera.update(tool.camera, cameraMsg)
            return [{ ...tool, camera }, { type: ToolType.Zoom, value: dragState }, []]
        }
        case ToolType.Rotate: {
            if (ephemeral.value !== null) return [tool, ephemeral, []]

            const dragState: Input.DragState = { clickPoint: pointer, prevPoint: pointer }

            const cameraMsg = Camera.rotateToolUpdate(tool.camera, dragState, pointer)
            const camera = Camera.update(tool.camera, cameraMsg)
            return [{ ...tool, camera }, { type: ToolType.Rotate, value: dragState }, []]
        }
    }
}

export function onDrag(
    tool: Tool,
    ephemeral_: EphemeralState,
    pointer: Input.PointerInput
): T3<Tool, EphemeralState, ReadonlyArray<BrushShader.BrushPoint>> {
    const ephemeral = syncEphemeral(tool, ephemeral_)

    switch (ephemeral.type) {
        case ToolType.Brush: {
            const [value, brushPoints] = Brush.onDrag(
                tool.camera,
                tool.brush,
                ephemeral.value,
                pointer
            )
            return [tool, { type: ToolType.Brush, value }, brushPoints]
        }
        case ToolType.Eraser: {
            const [value, brushPoints] = Eraser.onDrag(
                tool.camera,
                tool.eraser,
                ephemeral.value,
                pointer
            )
            return [tool, { type: ToolType.Eraser, value }, brushPoints]
        }
        case ToolType.Move: {
            if (ephemeral.value === null) return [tool, ephemeral, []]

            const cameraMsg = Camera.moveToolUpdate(tool.camera, ephemeral.value, pointer)
            const camera = Camera.update(tool.camera, cameraMsg)
            const dragState: Input.DragState = {
                clickPoint: ephemeral.value.clickPoint,
                prevPoint: pointer,
            }
            return [{ ...tool, camera }, { type: ToolType.Move, value: dragState }, []]
        }
        case ToolType.Zoom: {
            if (ephemeral.value === null) return [tool, ephemeral, []]

            const cameraMsg = Camera.zoomToolUpdate(tool.camera, ephemeral.value, pointer)
            const camera = Camera.update(tool.camera, cameraMsg)
            const dragState: Input.DragState = {
                clickPoint: ephemeral.value.clickPoint,
                prevPoint: pointer,
            }
            return [{ ...tool, camera }, { type: ToolType.Zoom, value: dragState }, []]
        }
        case ToolType.Rotate: {
            if (ephemeral.value === null) return [tool, ephemeral, []]

            const cameraMsg = Camera.rotateToolUpdate(tool.camera, ephemeral.value, pointer)
            const camera = Camera.update(tool.camera, cameraMsg)
            const dragState: Input.DragState = {
                clickPoint: ephemeral.value.clickPoint,
                prevPoint: pointer,
            }
            return [{ ...tool, camera }, { type: ToolType.Rotate, value: dragState }, []]
        }
    }
}

export function onRelease(
    tool: Tool,
    ephemeral_: EphemeralState,
    pointer: Input.PointerInput
): T3<Tool, EphemeralState, ReadonlyArray<BrushShader.BrushPoint>> {
    const ephemeral = syncEphemeral(tool, ephemeral_)

    switch (ephemeral.type) {
        case ToolType.Brush: {
            const [value, brushPoints] = Brush.onRelease(
                tool.camera,
                tool.brush,
                ephemeral.value,
                pointer
            )
            return [tool, { type: ToolType.Brush, value }, brushPoints]
        }
        case ToolType.Eraser: {
            const [value, brushPoints] = Eraser.onRelease(
                tool.camera,
                tool.eraser,
                ephemeral.value,
                pointer
            )
            return [tool, { type: ToolType.Eraser, value }, brushPoints]
        }
        case ToolType.Move: {
            if (ephemeral.value === null) return [tool, ephemeral, []]

            const cameraMsg = Camera.moveToolUpdate(tool.camera, ephemeral.value, pointer)
            const camera = Camera.update(tool.camera, cameraMsg)
            return [{ ...tool, camera }, { type: ToolType.Move, value: null }, []]
        }
        case ToolType.Zoom: {
            if (ephemeral.value === null) return [tool, ephemeral, []]

            const cameraMsg = Camera.zoomToolUpdate(tool.camera, ephemeral.value, pointer)
            const camera = Camera.update(tool.camera, cameraMsg)
            return [{ ...tool, camera }, { type: ToolType.Zoom, value: null }, []]
        }
        case ToolType.Rotate: {
            if (ephemeral.value === null) return [tool, ephemeral, []]
            const cameraMsg = Camera.rotateToolUpdate(tool.camera, ephemeral.value, pointer)
            const camera = Camera.update(tool.camera, cameraMsg)
            return [{ ...tool, camera }, { type: ToolType.Rotate, value: null }, []]
        }
    }
}

export function onFrame(
    tool: Tool,
    ephemeral_: EphemeralState,
    currentTime: number
): T2<EphemeralState, ReadonlyArray<BrushShader.BrushPoint>> {
    const ephemeral = syncEphemeral(tool, ephemeral_)

    switch (ephemeral.type) {
        case ToolType.Brush: {
            const [value, brushPoints] = Brush.onFrame(tool.brush, ephemeral.value, currentTime)
            if (value === ephemeral.value && brushPoints.length === 0) {
                return [ephemeral, brushPoints]
            } else {
                return [{ type: ToolType.Brush, value }, brushPoints]
            }
        }
        case ToolType.Eraser: {
            const [value, brushPoints] = Eraser.onFrame(tool.eraser, ephemeral.value, currentTime)
            if (value === ephemeral.value && brushPoints.length === 0) {
                return [ephemeral, brushPoints]
            } else {
                return [{ type: ToolType.Eraser, value }, brushPoints]
            }
        }
        default:
            return [ephemeral, []]
    }
}

export function getBlendMode(tool: Tool): Blend.Mode {
    switch (tool.current) {
        case ToolType.Brush:
            return Blend.Mode.Normal
        case ToolType.Eraser:
            return Blend.Mode.Erase
        default:
            console.warn(
                "Getting BlendMode for type " +
                    tool.current +
                    ", which is neithre a Brush or Eraser"
            )
            return Blend.Mode.Normal
    }
}

export function getSoftness(tool: Tool): number {
    switch (tool.current) {
        case ToolType.Brush:
            return tool.brush.softness
        case ToolType.Eraser:
            return tool.eraser.softness
        default:
            console.warn(
                "Getting Softness for type " + tool.current + ", which is neithre a Brush or Eraser"
            )
            return 0
    }
}
