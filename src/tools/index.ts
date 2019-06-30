import * as Brush from "./brush"
import * as Eraser from "./eraser"
import * as Camera from "./camera"
import * as BrushShader from "../canvas/brushShader"
import { Blend } from "../webgl"
import { TransformedPointerInput } from "../canvas"

export const enum ToolMsgType {
    SetToolMsg,
    BrushMsg,
    EraserMsg,
    CameraMsg,
}

export type ToolMsg = SetToolMsg | BrushMsg | EraserMsg | CameraMsg

class SetToolMsg {
    readonly type: ToolMsgType.SetToolMsg = ToolMsgType.SetToolMsg
    private nominal: void
    constructor(readonly subType: ToolType) {}
}
class BrushMsg {
    readonly type: ToolMsgType.BrushMsg = ToolMsgType.BrushMsg
    private nominal: void
    constructor(readonly msg: Brush.Msg) {}
}
class EraserMsg {
    readonly type: ToolMsgType.EraserMsg = ToolMsgType.EraserMsg
    private nominal: void
    constructor(readonly msg: Eraser.Msg) {}
}
class CameraMsg {
    readonly type: ToolMsgType.CameraMsg = ToolMsgType.CameraMsg
    private nominal: void
    constructor(readonly msg: Camera.Msg) {}
}

export class MsgSender {
    readonly brush: Brush.MsgSender
    readonly eraser: Eraser.MsgSender
    readonly camera: Camera.MsgSender

    readonly setTool = (type: ToolType) => {
        this.sendMessage(new SetToolMsg(type))
    }

    constructor(private sendMessage: (msg: ToolMsg) => void) {
        this.brush = new Brush.MsgSender(msg => sendMessage(new BrushMsg(msg)))
        this.eraser = new Eraser.MsgSender(msg => sendMessage(new EraserMsg(msg)))
        this.camera = new Camera.MsgSender(msg => sendMessage(new CameraMsg(msg)))
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
    readonly type: ToolType.Brush = ToolType.Brush
    private nominal: void
    constructor(readonly state: Brush.EphemeralState) {}
}
class EraserState {
    readonly type: ToolType.Eraser = ToolType.Eraser
    private nominal: void
    constructor(readonly state: Eraser.EphemeralState) {}
}
class MoveState {
    readonly type: ToolType.Move = ToolType.Move
    private nominal: void
    constructor(readonly state: Camera.DragState | null) {}
}
class ZoomState {
    readonly type: ToolType.Zoom = ToolType.Zoom
    private nominal: void
    constructor(readonly state: Camera.DragState | null) {}
}
class RotateState {
    readonly type: ToolType.Rotate = ToolType.Rotate
    private nominal: void
    constructor(readonly state: Camera.DragState | null) {}
}

export type EphemeralState = BrushState | EraserState | MoveState | ZoomState | RotateState

export const enum EphemeralStateType {
    BrushState,
    EraserState,
    MoveState,
    ZoomState,
    RotateState,
}

export function init(): Tool {
    return {
        brush: Brush.init(),
        eraser: Eraser.init(),
        camera: Camera.State.init,
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
    switch (msg.type) {
        case ToolMsgType.SetToolMsg:
            switch (msg.subType) {
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
        case ToolMsgType.BrushMsg:
            return { ...tool, brush: Brush.update(tool.brush, msg.msg) }
        case ToolMsgType.EraserMsg:
            return { ...tool, eraser: Eraser.update(tool.eraser, msg.msg) }
        case ToolMsgType.CameraMsg:
            return { ...tool, camera: tool.camera.update(msg.msg) }
        default:
            const never: never = msg
            throw { "unexpected msg": msg }
    }
}

function syncEphemeral(tool: Tool, ephemeral: EphemeralState): EphemeralState {
    if (ephemeral.type === tool.current) {
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
        default:
            const never: never = tool.current
            throw { "Unknown tool type: ": tool.current }
    }
}

export function onClick(
    tool: Tool,
    ephemeral_: EphemeralState,
    pointer: TransformedPointerInput
): readonly [Tool, EphemeralState, readonly BrushShader.BrushPoint[]] {
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
            if (ephemeral.state !== null) {
                return [tool, ephemeral, []]
            }

            const dragState: Camera.DragState = {
                clickPoint: pointer,
                prevPoint: pointer,
                originalScale: tool.camera.zoomPct,
            }
            const camera = tool.camera.moveUpdate(dragState, pointer)
            return [{ ...tool, camera }, new MoveState(dragState), []]
        }
        case ToolType.Zoom: {
            if (ephemeral.state !== null) {
                return [tool, ephemeral, []]
            }

            const dragState: Camera.DragState = {
                clickPoint: pointer,
                prevPoint: pointer,
                originalScale: tool.camera.zoomPct,
            }
            const camera = tool.camera.zoomUpdate(dragState, pointer)
            return [{ ...tool, camera }, new ZoomState(dragState), []]
        }
        case ToolType.Rotate: {
            if (ephemeral.state !== null) {
                return [tool, ephemeral, []]
            }

            const dragState: Camera.DragState = {
                clickPoint: pointer,
                prevPoint: pointer,
                originalScale: tool.camera.zoomPct,
            }
            const camera = tool.camera.rotateUpdate(dragState, pointer)
            return [{ ...tool, camera }, new RotateState(dragState), []]
        }
        default:
            const never: never = ephemeral
            throw { "unxpected state": ephemeral }
    }
}

export function onDrag(
    tool: Tool,
    ephemeral_: EphemeralState,
    pointers: readonly TransformedPointerInput[]
): readonly [Tool, EphemeralState, readonly BrushShader.BrushPoint[]] {
    const ephemeral = syncEphemeral(tool, ephemeral_)

    switch (ephemeral.type) {
        case ToolType.Brush: {
            const [value, brushPoints] = Brush.onDrag(
                tool.camera,
                tool.brush,
                ephemeral.state,
                pointers
            )
            return [tool, new BrushState(value), brushPoints]
        }
        case ToolType.Eraser: {
            const [value, brushPoints] = Eraser.onDrag(
                tool.camera,
                tool.eraser,
                ephemeral.state,
                pointers
            )
            return [tool, new EraserState(value), brushPoints]
        }
        case ToolType.Move: {
            if (ephemeral.state === null) {
                return [tool, ephemeral, []]
            }
            const pointer = pointers[pointers.length - 1]
            const camera = tool.camera.moveUpdate(ephemeral.state, pointer)
            const dragState: Camera.DragState = {
                clickPoint: ephemeral.state.clickPoint,
                prevPoint: pointer,
                originalScale: ephemeral.state.originalScale,
            }
            return [{ ...tool, camera }, new MoveState(dragState), []]
        }
        case ToolType.Zoom: {
            if (ephemeral.state === null) {
                return [tool, ephemeral, []]
            }
            const pointer = pointers[pointers.length - 1]
            const camera = tool.camera.zoomUpdate(ephemeral.state, pointer)
            const dragState: Camera.DragState = {
                clickPoint: ephemeral.state.clickPoint,
                prevPoint: pointer,
                originalScale: ephemeral.state.originalScale,
            }
            return [{ ...tool, camera }, new ZoomState(dragState), []]
        }
        case ToolType.Rotate: {
            if (ephemeral.state === null) {
                return [tool, ephemeral, []]
            }
            const pointer = pointers[pointers.length - 1]
            const camera = tool.camera.rotateUpdate(ephemeral.state, pointer)
            const dragState: Camera.DragState = {
                clickPoint: ephemeral.state.clickPoint,
                prevPoint: pointer,
                originalScale: ephemeral.state.originalScale,
            }
            return [{ ...tool, camera }, new RotateState(dragState), []]
        }
        default:
            const never: never = ephemeral
            throw { "unxpected state": ephemeral }
    }
}

export function onRelease(
    tool: Tool,
    ephemeral_: EphemeralState,
    pointer: TransformedPointerInput
): readonly [Tool, EphemeralState, readonly BrushShader.BrushPoint[]] {
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
            if (ephemeral.state === null) {
                return [tool, ephemeral, []]
            }

            const camera = tool.camera.moveUpdate(ephemeral.state, pointer)
            return [{ ...tool, camera }, new MoveState(null), []]
        }
        case ToolType.Zoom: {
            if (ephemeral.state === null) {
                return [tool, ephemeral, []]
            }

            const camera = tool.camera.zoomUpdate(ephemeral.state, pointer)
            return [{ ...tool, camera }, new ZoomState(null), []]
        }
        case ToolType.Rotate: {
            if (ephemeral.state === null) {
                return [tool, ephemeral, []]
            }

            const camera = tool.camera.rotateUpdate(ephemeral.state, pointer)
            return [{ ...tool, camera }, new RotateState(null), []]
        }
        default:
            const never: never = ephemeral
            throw { "unxpected state": ephemeral }
    }
}

export function onFrame(
    tool: Tool,
    ephemeral_: EphemeralState,
    currentTime: number
): [EphemeralState, readonly BrushShader.BrushPoint[]] {
    const ephemeral = syncEphemeral(tool, ephemeral_)

    switch (ephemeral.type) {
        case ToolType.Brush: {
            const [value, brushPoints] = Brush.onFrame(tool.brush, ephemeral.state, currentTime)
            if (value === ephemeral.state && brushPoints.length === 0) {
                return [ephemeral, brushPoints]
            } else {
                return [new BrushState(value), brushPoints]
            }
        }
        case ToolType.Eraser: {
            const [value, brushPoints] = Eraser.onFrame(tool.eraser, ephemeral.state, currentTime)
            if (value === ephemeral.state && brushPoints.length === 0) {
                return [ephemeral, brushPoints]
            } else {
                return [new EraserState(value), brushPoints]
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
            return 0
    }
}
