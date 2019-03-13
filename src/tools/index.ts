import * as Input from "../input"
import * as Brush from "./brush"
import * as Eraser from "./eraser"
import * as Camera from "./camera"
import * as BrushShader from "../canvas/brushShader"
import { Blend } from "../webgl"
import { T2, T3 } from "../util"

class SetToolMsg {
    private nominal: void
    constructor(readonly type: ToolType) {}
}
class BrushMsg {
    private nominal: void
    constructor(readonly msg: Brush.Msg) {}
}
class EraserMsg {
    private nominal: void
    constructor(readonly msg: Eraser.Msg) {}
}
class CameraMsg {
    private nominal: void
    constructor(readonly msg: Camera.Msg) {}
}

export type ToolMsg =
    | SetToolMsg
    | BrushMsg
    | EraserMsg
    | CameraMsg

export interface MsgSender {
    readonly brush: Brush.MsgSender
    readonly eraser: Eraser.MsgSender
    readonly camera: Camera.MsgSender
    setTool(type: ToolType): void
}

export function createSender(sendMessage: (msg: ToolMsg) => void): MsgSender {
    return {
        brush: Brush.createBrushSender(msg => sendMessage(new BrushMsg(msg))),
        eraser: Eraser.createBrushSender(msg => sendMessage(new EraserMsg(msg))),
        camera: Camera.createSender(msg => sendMessage(new CameraMsg(msg))),
        setTool: type => sendMessage(new SetToolMsg(type)),
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

class BrushState {
    private nominal: void
    constructor(readonly state: Brush.EphemeralState) {}
    get type(): ToolType.Brush {
        return ToolType.Brush
    }
}
class EraserState {
    private nominal: void
    constructor(readonly state: Eraser.EphemeralState) {}
    get type(): ToolType.Eraser {
        return ToolType.Eraser
    }
}
class MoveState {
    private nominal: void
    constructor(readonly state: Input.DragState | null) {}
    get type(): ToolType.Move {
        return ToolType.Move
    }
}
class ZoomState {
    private nominal: void
    constructor(readonly state: Input.DragState | null) {}
    get type(): ToolType.Zoom {
        return ToolType.Zoom
    }
}
class RotateState {
    private nominal: void
    constructor(readonly state: Input.DragState | null) {}
    get type(): ToolType.Rotate {
        return ToolType.Rotate
    }
}

export type EphemeralState =
    | BrushState
    | EraserState
    | MoveState
    | ZoomState
    | RotateState

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
    return new BrushState(Brush.initTempState()) 
}

function eraserToolInit(): EphemeralState {
    return new EraserState(Eraser.initTempState())
}

function moveToolInit(): EphemeralState {
    return new MoveState(null)
}

function zoomToolInit(): EphemeralState {
    return new ZoomState(null)
}

function rotateToolInit(): EphemeralState {
    return new RotateState(null)
}

export function update(tool: Tool, msg: ToolMsg): Tool {
    if (msg instanceof SetToolMsg) {
        switch (msg.type) {
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
                throw { "unexpected tool type: ": msg.type }
        }
    }
    if (msg instanceof BrushMsg) {
        return { ...tool, brush: Brush.update(tool.brush, msg.msg) }
    }
    if (msg instanceof EraserMsg) {
        return { ...tool, eraser: Eraser.update(tool.eraser, msg.msg) }
    }
    if (msg instanceof CameraMsg) {
        return { ...tool, camera: Camera.update(tool.camera, msg.msg) }
    }
    const never: never = msg
    throw { "unexpected msg": msg }
}

function syncEphemeral(tool: Tool, ephemeral: EphemeralState): EphemeralState {
    if (ephemeral.type == tool.current) {
        return ephemeral
    }
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
    }
    const never: never = tool.current
    throw { "Unknown tool type: ": tool.current }
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
            return [tool, new BrushState(value), [brushPoint]]
        }
        case ToolType.Eraser: {
            const [value, brushPoint] = Eraser.onClick(tool.camera, tool.eraser, pointer)
            return [tool, new EraserState(value), [brushPoint]]
        }
        case ToolType.Move: {
            if (ephemeral.state !== null) return [tool, ephemeral, []]

            const dragState: Input.DragState = { clickPoint: pointer, prevPoint: pointer }

            const cameraMsg = Camera.moveToolUpdate(tool.camera, dragState, pointer)
            const camera = Camera.update(tool.camera, cameraMsg)
            return [{ ...tool, camera }, new MoveState(dragState), []]
        }
        case ToolType.Zoom: {
            if (ephemeral.state !== null) return [tool, ephemeral, []]

            const dragState: Input.DragState = { clickPoint: pointer, prevPoint: pointer }

            const cameraMsg = Camera.zoomToolUpdate(tool.camera, dragState, pointer)
            const camera = Camera.update(tool.camera, cameraMsg)
            return [{ ...tool, camera }, new ZoomState(dragState), []]
        }
        case ToolType.Rotate: {
            if (ephemeral.state !== null) return [tool, ephemeral, []]

            const dragState: Input.DragState = { clickPoint: pointer, prevPoint: pointer }

            const cameraMsg = Camera.rotateToolUpdate(tool.camera, dragState, pointer)
            const camera = Camera.update(tool.camera, cameraMsg)
            return [{ ...tool, camera }, new RotateState(dragState), []]
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
                ephemeral.state,
                pointer
            )
            return [tool, new BrushState(value), brushPoints]
        }
        case ToolType.Eraser: {
            const [value, brushPoints] = Eraser.onDrag(
                tool.camera,
                tool.eraser,
                ephemeral.state,
                pointer
            )
            return [tool, new EraserState(value), brushPoints]
        }
        case ToolType.Move: {
            if (ephemeral.state === null) return [tool, ephemeral, []]
    
            const cameraMsg = Camera.moveToolUpdate(tool.camera, ephemeral.state, pointer)
            const camera = Camera.update(tool.camera, cameraMsg)
            const dragState: Input.DragState = {
                clickPoint: ephemeral.state.clickPoint,
                prevPoint: pointer,
            }
            return [{ ...tool, camera }, new MoveState(dragState), []]
        }
        case ToolType.Zoom: {
            if (ephemeral.state === null) return [tool, ephemeral, []]
    
            const cameraMsg = Camera.zoomToolUpdate(tool.camera, ephemeral.state, pointer)
            const camera = Camera.update(tool.camera, cameraMsg)
            const dragState: Input.DragState = {
                clickPoint: ephemeral.state.clickPoint,
                prevPoint: pointer,
            }
            return [{ ...tool, camera }, new ZoomState(dragState), []]
        }
        case ToolType.Rotate: {
            if (ephemeral.state === null) return [tool, ephemeral, []]
    
            const cameraMsg = Camera.rotateToolUpdate(tool.camera, ephemeral.state, pointer)
            const camera = Camera.update(tool.camera, cameraMsg)
            const dragState: Input.DragState = {
                clickPoint: ephemeral.state.clickPoint,
                prevPoint: pointer,
            }
            return [{ ...tool, camera }, new RotateState(dragState), []]
        }
    }
    const never: never = ephemeral
    throw { "expected state": ephemeral }
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
                ephemeral.state,
                pointer
            )
            return [tool, new BrushState(value), brushPoints]
        }
        case ToolType.Eraser: {
            const [value, brushPoints] = Eraser.onRelease(
                tool.camera,
                tool.eraser,
                ephemeral.state,
                pointer
            )
            return [tool, new EraserState(value), brushPoints]
        }
        case ToolType.Move: {
            if (ephemeral.state === null) return [tool, ephemeral, []]
    
            const cameraMsg = Camera.moveToolUpdate(tool.camera, ephemeral.state, pointer)
            const camera = Camera.update(tool.camera, cameraMsg)
            return [{ ...tool, camera },new MoveState(null), []]
        }
        case ToolType.Zoom: {
            if (ephemeral.state === null) return [tool, ephemeral, []]
    
            const cameraMsg = Camera.zoomToolUpdate(tool.camera, ephemeral.state, pointer)
            const camera = Camera.update(tool.camera, cameraMsg)
            return [{ ...tool, camera }, new ZoomState(null), []]
        }
        case ToolType.Rotate: {
            if (ephemeral.state === null) return [tool, ephemeral, []]

            const cameraMsg = Camera.rotateToolUpdate(tool.camera, ephemeral.state, pointer)
            const camera = Camera.update(tool.camera, cameraMsg)
            return [{ ...tool, camera }, new RotateState(null), []]
        }
    }
    const never: never = ephemeral
    throw { "expected state": ephemeral }
}

export function onFrame(
    tool: Tool,
    ephemeral_: EphemeralState,
    currentTime: number
): T2<EphemeralState, ReadonlyArray<BrushShader.BrushPoint>> {
    const ephemeral = syncEphemeral(tool, ephemeral_)

    if (ephemeral instanceof BrushState) {
        const [value, brushPoints] = Brush.onFrame(tool.brush, ephemeral.state, currentTime)
        if (value === ephemeral.state && brushPoints.length === 0) {
            return [ephemeral, brushPoints]
        } else {
            return [new BrushState(value), brushPoints]
        }
    }
    if (ephemeral instanceof EraserState) {
        const [value, brushPoints] = Eraser.onFrame(tool.eraser, ephemeral.state, currentTime)
        if (value === ephemeral.state && brushPoints.length === 0) {
            return [ephemeral, brushPoints]
        } else {
            return [new EraserState(value), brushPoints]
        }
    }
    return [ephemeral, []]
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
