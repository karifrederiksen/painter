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

export class SetToolMsg {
    readonly type = ToolMsgType.SetToolMsg as const
    constructor(readonly subType: ToolType) {}
}
export class BrushMsg {
    readonly type = ToolMsgType.BrushMsg as const
    constructor(readonly msg: Brush.Msg) {}
}
export class EraserMsg {
    readonly type = ToolMsgType.EraserMsg as const
    constructor(readonly msg: Eraser.Msg) {}
}
export class CameraMsg {
    readonly type = ToolMsgType.CameraMsg as const
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
        this.brush = new Brush.MsgSender((msg) => sendMessage(new BrushMsg(msg)))
        this.eraser = new Eraser.MsgSender((msg) => sendMessage(new EraserMsg(msg)))
        this.camera = new Camera.MsgSender((msg) => sendMessage(new CameraMsg(msg)))
    }
}

export const enum ToolType {
    Brush,
    Eraser,
    Move,
    Zoom,
    Rotate,
}

class BrushState {
    readonly type = ToolType.Brush as const
    constructor(readonly state: Brush.State) {}
}
class EraserState {
    readonly type = ToolType.Eraser as const
    constructor(readonly state: Eraser.State) {}
}
class MoveState {
    readonly type = ToolType.Move as const
    constructor(readonly state: Camera.DragState | null) {}
}
class ZoomState {
    readonly type = ToolType.Zoom as const
    constructor(readonly state: Camera.DragState | null) {}
}
class RotateState {
    readonly type = ToolType.Rotate as const
    constructor(readonly state: Camera.DragState | null) {}
}

export interface Config {
    readonly brush: Brush.Config
    readonly eraser: Eraser.Config
    readonly camera: Camera.Config
    readonly current: ToolType
}

export const init: Config = {
    brush: Brush.init,
    eraser: Eraser.init,
    camera: Camera.init,
    current: ToolType.Brush,
}

export function update(tool: Config, msg: ToolMsg): Config {
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
                    const never: never = msg.subType
                    throw { "unexpected tool type: ": msg.type }
            }
        case ToolMsgType.BrushMsg:
            return { ...tool, brush: Brush.update(tool.brush, msg.msg) }
        case ToolMsgType.EraserMsg:
            return { ...tool, eraser: Eraser.update(tool.eraser, msg.msg) }
        case ToolMsgType.CameraMsg:
            return { ...tool, camera: Camera.update(tool.camera, msg.msg) }
        default:
            const never: never = msg
            throw { "unexpected msg": msg }
    }
}

export function onClick(
    tool: Config,
    ephemeral_: State,
    pointer: TransformedPointerInput
): readonly [Config, State, readonly BrushShader.BrushPoint[]] {
    const ephemeral = syncEphemeral(tool, ephemeral_)

    switch (ephemeral.type) {
        case ToolType.Brush: {
            const [value, brushPoint] = Brush.onClick(tool.brush, tool.camera, pointer)
            return [tool, new BrushState(value), [brushPoint]]
        }
        case ToolType.Eraser: {
            const [value, brushPoint] = Eraser.onClick(tool.eraser, tool.camera, pointer)
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
            const camera = Camera.moveUpdate(tool.camera, dragState, pointer)
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
            const camera = Camera.zoomUpdate(tool.camera, dragState, pointer)
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
            const camera = Camera.rotateUpdate(tool.camera, dragState, pointer)
            return [{ ...tool, camera }, new RotateState(dragState), []]
        }
        default:
            const never: never = ephemeral
            throw { "unxpected state": ephemeral }
    }
}

export function onDrag(
    tool: Config,
    ephemeral_: State,
    pointers: readonly TransformedPointerInput[]
): readonly [Config, State, readonly BrushShader.BrushPoint[]] {
    const ephemeral = syncEphemeral(tool, ephemeral_)

    switch (ephemeral.type) {
        case ToolType.Brush: {
            const [value, brushPoints] = Brush.onDrag(
                tool.brush,
                tool.camera,
                ephemeral.state,
                pointers
            )
            return [tool, new BrushState(value), brushPoints]
        }
        case ToolType.Eraser: {
            const [value, brushPoints] = Eraser.onDrag(
                tool.eraser,
                tool.camera,
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
            const camera = Camera.moveUpdate(tool.camera, ephemeral.state, pointer)
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
            const camera = Camera.zoomUpdate(tool.camera, ephemeral.state, pointer)
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
            const camera = Camera.rotateUpdate(tool.camera, ephemeral.state, pointer)
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
    tool: Config,
    ephemeral_: State,
    pointer: TransformedPointerInput
): readonly [Config, State, readonly BrushShader.BrushPoint[]] {
    const ephemeral = syncEphemeral(tool, ephemeral_)

    switch (ephemeral.type) {
        case ToolType.Brush: {
            const [value, brushPoints] = Brush.onRelease()
            return [tool, new BrushState(value), brushPoints]
        }
        case ToolType.Eraser: {
            const [value, brushPoints] = Eraser.onRelease()
            return [tool, new EraserState(value), brushPoints]
        }
        case ToolType.Move: {
            if (ephemeral.state === null) {
                return [tool, ephemeral, []]
            }

            const camera = Camera.moveUpdate(tool.camera, ephemeral.state, pointer)
            return [{ ...tool, camera }, new MoveState(null), []]
        }
        case ToolType.Zoom: {
            if (ephemeral.state === null) {
                return [tool, ephemeral, []]
            }

            const camera = Camera.zoomUpdate(tool.camera, ephemeral.state, pointer)
            return [{ ...tool, camera }, new ZoomState(null), []]
        }
        case ToolType.Rotate: {
            if (ephemeral.state === null) {
                return [tool, ephemeral, []]
            }

            const camera = Camera.rotateUpdate(tool.camera, ephemeral.state, pointer)
            return [{ ...tool, camera }, new RotateState(null), []]
        }
        default:
            const never: never = ephemeral
            throw { "unxpected state": ephemeral }
    }
}

export function onFrame(
    tool: Config,
    state: State,
    currentTime: number
): [State, readonly BrushShader.BrushPoint[]] {
    const ephemeral = syncEphemeral(tool, state)

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

export type State = BrushState | EraserState | MoveState | ZoomState | RotateState

export const enum EphemeralStateType {
    BrushState,
    EraserState,
    MoveState,
    ZoomState,
    RotateState,
}

export function initEphemeral(): State {
    return new BrushState(Brush.initTempState())
}

function syncEphemeral(tool: Config, ephemeral: State): State {
    if (ephemeral.type === tool.current) {
        return ephemeral
    }
    switch (tool.current) {
        case ToolType.Brush:
            return new BrushState(Brush.initTempState())
        case ToolType.Eraser:
            return new EraserState(Eraser.initTempState())
        case ToolType.Move:
            return new MoveState(null)
        case ToolType.Rotate:
            return new RotateState(null)
        case ToolType.Zoom:
            return new ZoomState(null)
        default:
            const never: never = tool.current
            throw { "Unknown tool type: ": tool.current }
    }
}

export function getBlendMode(tool: Config): Blend.Mode {
    switch (tool.current) {
        case ToolType.Brush:
            return Blend.Mode.Normal
        case ToolType.Eraser:
            return Blend.Mode.Erase
        default:
            return Blend.Mode.Normal
    }
}

export function getSoftness(tool: Config): number {
    switch (tool.current) {
        case ToolType.Brush:
            return tool.brush.softness
        case ToolType.Eraser:
            return tool.eraser.softness
        default:
            return 0
    }
}
