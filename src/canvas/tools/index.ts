export { BrushTool } from "./brushtool"
import { T2, Case } from "../../core"
import { DragState, PointerInput } from "../input"
import {
    update as brushUpdate,
    BrushTool,
    init as brushInit,
    BrushTempState,
    initTempState as brushInitTempState,
    onClick as brushOnClick,
    onDrag as brushOnDrag,
    onRelease as brushOnRelease,
    onFrame as brushOnFrame,
} from "./brushtool"
import {
    Camera,
    update as cameraUpdate,
    init as cameraInit,
    moveToolUpdate,
    zoomToolUpdate,
    rotateToolUpdate,
} from "./cameratools"
import { BrushPoint } from "../rendering/brushShader"
import { ToolMsgType, ToolMsg } from "./messages"

export { ToolMsgType, ToolMsg } from "./messages"

export const enum ToolType {
    Brush,
    Eraser,
    Move,
    Zoom,
    Rotate,
}

export interface Tool {
    readonly brush: BrushTool
    readonly eraser: BrushTool
    readonly camera: Camera
    readonly current: CurrentTool
}

export type CurrentTool =
    | Case<ToolType.Brush, BrushTempState>
    | Case<ToolType.Eraser, BrushTempState>
    | Case<ToolType.Move, DragState | null>
    | Case<ToolType.Zoom, DragState | null>
    | Case<ToolType.Rotate, DragState | null>

export function init(): Tool {
    return {
        brush: brushInit(),
        eraser: brushInit(),
        camera: cameraInit(),
        current: brushToolInit(),
    }
}

function brushToolInit(): CurrentTool {
    return {
        type: ToolType.Brush,
        state: brushInitTempState(),
    }
}

function eraserToolInit(): CurrentTool {
    return {
        type: ToolType.Eraser,
        state: brushInitTempState(),
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
            return { ...tool, brush: brushUpdate(tool.brush, msg.payload) }
        case ToolMsgType.EraserMsg:
            return { ...tool, eraser: brushUpdate(tool.eraser, msg.payload) }
        case ToolMsgType.CameraMsg:
            return { ...tool, camera: cameraUpdate(tool.camera, msg.payload) }
    }
}

export function onClick(tool: Tool, pointer: PointerInput): T2<Tool, ReadonlyArray<BrushPoint>> {
    const { current } = tool
    switch (current.type) {
        case ToolType.Brush: {
            const [state, brushPoint] = brushOnClick(tool.camera, tool.brush, pointer)
            return [{ ...tool, current: { type: ToolType.Brush, state } }, [brushPoint]]
        }
        case ToolType.Eraser: {
            throw "todo"
        }
        case ToolType.Move: {
            if (current.state !== null) return [tool, []]

            const dragState: DragState = { clickPoint: pointer, prevPoint: pointer }

            const cameraMsg = moveToolUpdate(tool.camera, dragState, pointer)
            const camera = cameraUpdate(tool.camera, cameraMsg)
            return [{ ...tool, camera, current: { type: ToolType.Move, state: dragState } }, []]
        }
        case ToolType.Zoom: {
            if (current.state !== null) return [tool, []]

            const dragState: DragState = { clickPoint: pointer, prevPoint: pointer }

            const cameraMsg = zoomToolUpdate(tool.camera, dragState, pointer)
            const camera = cameraUpdate(tool.camera, cameraMsg)
            return [{ ...tool, camera, current: { type: ToolType.Zoom, state: dragState } }, []]
        }
        case ToolType.Rotate: {
            if (current.state !== null) return [tool, []]

            const dragState: DragState = { clickPoint: pointer, prevPoint: pointer }

            const cameraMsg = rotateToolUpdate(tool.camera, dragState, pointer)
            const camera = cameraUpdate(tool.camera, cameraMsg)
            return [{ ...tool, camera, current: { type: ToolType.Rotate, state: dragState } }, []]
        }
    }
}

export function onDrag(tool: Tool, pointer: PointerInput): T2<Tool, ReadonlyArray<BrushPoint>> {
    const { current } = tool
    switch (current.type) {
        case ToolType.Brush: {
            const [state, brushPoints] = brushOnDrag(
                tool.camera,
                tool.brush,
                current.state,
                pointer
            )
            return [{ ...tool, current: { type: ToolType.Brush, state } }, brushPoints]
        }
        case ToolType.Eraser: {
            throw "todo"
        }
        case ToolType.Move: {
            if (current.state === null) return [tool, []]

            const cameraMsg = moveToolUpdate(tool.camera, current.state, pointer)
            const camera = cameraUpdate(tool.camera, cameraMsg)
            const dragState: DragState = {
                clickPoint: current.state.clickPoint,
                prevPoint: pointer,
            }
            return [{ ...tool, camera, current: { type: ToolType.Move, state: dragState } }, []]
        }
        case ToolType.Zoom: {
            if (current.state === null) return [tool, []]

            const cameraMsg = zoomToolUpdate(tool.camera, current.state, pointer)
            const camera = cameraUpdate(tool.camera, cameraMsg)
            const dragState: DragState = {
                clickPoint: current.state.clickPoint,
                prevPoint: pointer,
            }
            return [{ ...tool, camera, current: { type: ToolType.Zoom, state: dragState } }, []]
        }
        case ToolType.Rotate: {
            if (current.state === null) return [tool, []]

            const cameraMsg = rotateToolUpdate(tool.camera, current.state, pointer)
            const camera = cameraUpdate(tool.camera, cameraMsg)
            const dragState: DragState = {
                clickPoint: current.state.clickPoint,
                prevPoint: pointer,
            }
            return [{ ...tool, camera, current: { type: ToolType.Rotate, state: dragState } }, []]
        }
    }
}

export function onRelease(tool: Tool, pointer: PointerInput): T2<Tool, ReadonlyArray<BrushPoint>> {
    const { current } = tool
    switch (current.type) {
        case ToolType.Brush: {
            const [state, brushPoints] = brushOnRelease(
                tool.camera,
                tool.brush,
                current.state,
                pointer
            )
            return [{ ...tool, current: { type: ToolType.Brush, state } }, brushPoints]
        }
        case ToolType.Eraser: {
            throw "todo"
        }
        case ToolType.Move: {
            if (current.state === null) return [tool, []]
            const cameraMsg = moveToolUpdate(tool.camera, current.state, pointer)
            const camera = cameraUpdate(tool.camera, cameraMsg)
            return [{ ...tool, camera, current: { type: ToolType.Move, state: null } }, []]
        }
        case ToolType.Zoom: {
            if (current.state === null) return [tool, []]
            const cameraMsg = zoomToolUpdate(tool.camera, current.state, pointer)
            const camera = cameraUpdate(tool.camera, cameraMsg)
            return [{ ...tool, camera, current: { type: ToolType.Zoom, state: null } }, []]
        }
        case ToolType.Rotate: {
            if (current.state === null) return [tool, []]
            const cameraMsg = rotateToolUpdate(tool.camera, current.state, pointer)
            const camera = cameraUpdate(tool.camera, cameraMsg)
            return [{ ...tool, camera, current: { type: ToolType.Rotate, state: null } }, []]
        }
    }
}

export function onFrame(tool: Tool, currentTime: number): T2<Tool, ReadonlyArray<BrushPoint>> {
    const { current } = tool
    switch (current.type) {
        case ToolType.Brush: {
            const [state, brushPoints] = brushOnFrame(tool.brush, current.state, currentTime)
            return [{ ...tool, current: { type: ToolType.Brush, state } }, brushPoints]
        }
        case ToolType.Eraser: {
            throw "todo"
        }
        default:
            return [tool, []]
    }
}
