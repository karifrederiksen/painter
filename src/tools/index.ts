import * as Brush from "./brush"
import * as Camera from "./camera"
import * as BrushShader from "../canvas/brushShader"
import { Blend } from "../webgl"
import { TransformedPointerInput } from "../canvas"
import { Tagged, tagged } from "../util"

export type ToolMsg =
    | Tagged<"SetToolMsg", ToolType>
    | Tagged<"BrushMsg", Brush.Msg>
    | Tagged<"EraserMsg", Brush.Msg>
    | Tagged<"CameraMsg", Camera.Msg>

export class Sender {
    readonly brush: Brush.Sender
    readonly eraser: Brush.Sender
    readonly camera: Camera.Sender

    constructor(private sendMessage: (msg: ToolMsg) => void) {
        this.brush = new Brush.Sender((msg) => sendMessage(tagged("BrushMsg", msg)))
        this.eraser = new Brush.Sender((msg) => sendMessage(tagged("EraserMsg", msg)))
        this.camera = new Camera.Sender((msg) => sendMessage(tagged("CameraMsg", msg)))
    }

    setTool = (type: ToolType) => this.sendMessage(tagged("SetToolMsg", type))
}

export type ToolType = "Brush" | "Eraser" | "Move" | "Zoom" | "Rotate"

export interface Config {
    readonly brush: Brush.Config
    readonly eraser: Brush.Config
    readonly camera: Camera.Config
    readonly current: ToolType
}

export const init: Config = {
    brush: Brush.init,
    eraser: Brush.init,
    camera: Camera.init,
    current: "Brush",
}

export function update(tool: Config, msg: ToolMsg): Config {
    switch (msg.tag) {
        case "SetToolMsg":
            switch (msg.val) {
                case "Brush":
                    return { ...tool, current: "Brush" }
                case "Eraser":
                    return { ...tool, current: "Eraser" }
                case "Move":
                    return { ...tool, current: "Move" }
                case "Zoom":
                    return { ...tool, current: "Zoom" }
                case "Rotate":
                    return { ...tool, current: "Rotate" }
                default:
                    const never: never = msg
                    throw { "unexpected tool type: ": msg }
            }
        case "BrushMsg":
            return { ...tool, brush: Brush.update(tool.brush, msg.val) }
        case "EraserMsg":
            return { ...tool, eraser: Brush.update(tool.eraser, msg.val) }
        case "CameraMsg":
            return { ...tool, camera: Camera.update(tool.camera, msg.val) }
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

    switch (ephemeral.tag) {
        case "Brush": {
            const [value, brushPoint] = Brush.onClick(tool.brush, tool.camera, pointer)
            return [tool, tagged("Brush", value), [brushPoint]]
        }
        case "Eraser": {
            const [value, brushPoint] = Brush.onClick(tool.eraser, tool.camera, pointer)
            return [tool, tagged("Eraser", value), [brushPoint]]
        }
        case "Move": {
            if (ephemeral.val !== null) {
                return [tool, ephemeral, []]
            }

            const dragState: Camera.DragState = {
                clickPoint: pointer,
                prevPoint: pointer,
                originalScale: tool.camera.zoomPct,
            }
            const camera = Camera.moveUpdate(tool.camera, dragState, pointer)
            return [{ ...tool, camera }, tagged("Move", dragState), []]
        }
        case "Zoom": {
            if (ephemeral.val !== null) {
                return [tool, ephemeral, []]
            }

            const dragState: Camera.DragState = {
                clickPoint: pointer,
                prevPoint: pointer,
                originalScale: tool.camera.zoomPct,
            }
            const camera = Camera.zoomUpdate(tool.camera, dragState, pointer)
            return [{ ...tool, camera }, tagged("Zoom", dragState), []]
        }
        case "Rotate": {
            if (ephemeral.val !== null) {
                return [tool, ephemeral, []]
            }

            const dragState: Camera.DragState = {
                clickPoint: pointer,
                prevPoint: pointer,
                originalScale: tool.camera.zoomPct,
            }
            const camera = Camera.rotateUpdate(tool.camera, dragState, pointer)
            return [{ ...tool, camera }, tagged("Rotate", dragState), []]
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

    switch (ephemeral.tag) {
        case "Brush": {
            const [value, brushPoints] = Brush.onDrag(
                tool.brush,
                tool.camera,
                ephemeral.val,
                pointers
            )
            return [tool, tagged("Brush", value), brushPoints]
        }
        case "Eraser": {
            const [value, brushPoints] = Brush.onDrag(
                tool.eraser,
                tool.camera,
                ephemeral.val,
                pointers
            )
            return [tool, tagged("Eraser", value), brushPoints]
        }
        case "Move": {
            if (ephemeral.val === null) {
                return [tool, ephemeral, []]
            }
            const pointer = pointers[pointers.length - 1]
            const camera = Camera.moveUpdate(tool.camera, ephemeral.val, pointer)
            const dragState: Camera.DragState = {
                clickPoint: ephemeral.val.clickPoint,
                prevPoint: pointer,
                originalScale: ephemeral.val.originalScale,
            }
            return [{ ...tool, camera }, tagged("Move", dragState), []]
        }
        case "Zoom": {
            if (ephemeral.val === null) {
                return [tool, ephemeral, []]
            }
            const pointer = pointers[pointers.length - 1]
            const camera = Camera.zoomUpdate(tool.camera, ephemeral.val, pointer)
            const dragState: Camera.DragState = {
                clickPoint: ephemeral.val.clickPoint,
                prevPoint: pointer,
                originalScale: ephemeral.val.originalScale,
            }
            return [{ ...tool, camera }, tagged("Zoom", dragState), []]
        }
        case "Rotate": {
            if (ephemeral.val === null) {
                return [tool, ephemeral, []]
            }
            const pointer = pointers[pointers.length - 1]
            const camera = Camera.rotateUpdate(tool.camera, ephemeral.val, pointer)
            const dragState: Camera.DragState = {
                clickPoint: ephemeral.val.clickPoint,
                prevPoint: pointer,
                originalScale: ephemeral.val.originalScale,
            }
            return [{ ...tool, camera }, tagged("Rotate", dragState), []]
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

    switch (ephemeral.tag) {
        case "Brush": {
            const [value, brushPoints] = Brush.onRelease()
            return [tool, tagged("Brush", value), brushPoints]
        }
        case "Eraser": {
            const [value, brushPoints] = Brush.onRelease()
            return [tool, tagged("Eraser", value), brushPoints]
        }
        case "Move": {
            if (ephemeral.val === null) {
                return [tool, ephemeral, []]
            }

            const camera = Camera.moveUpdate(tool.camera, ephemeral.val, pointer)
            return [{ ...tool, camera }, tagged("Move", null), []]
        }
        case "Zoom": {
            if (ephemeral.val === null) {
                return [tool, ephemeral, []]
            }

            const camera = Camera.zoomUpdate(tool.camera, ephemeral.val, pointer)
            return [{ ...tool, camera }, tagged("Zoom", null), []]
        }
        case "Rotate": {
            if (ephemeral.val === null) {
                return [tool, ephemeral, []]
            }

            const camera = Camera.rotateUpdate(tool.camera, ephemeral.val, pointer)
            return [{ ...tool, camera }, tagged("Rotate", null), []]
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

    switch (ephemeral.tag) {
        case "Brush": {
            const [value, brushPoints] = Brush.onFrame(tool.brush, ephemeral.val, currentTime)
            if (value === ephemeral.val && brushPoints.length === 0) {
                return [ephemeral, brushPoints]
            } else {
                return [tagged("Brush", value), brushPoints]
            }
        }
        case "Eraser": {
            const [value, brushPoints] = Brush.onFrame(tool.eraser, ephemeral.val, currentTime)
            if (value === ephemeral.val && brushPoints.length === 0) {
                return [ephemeral, brushPoints]
            } else {
                return [tagged("Eraser", value), brushPoints]
            }
        }
        default:
            return [ephemeral, []]
    }
}

export type State =
    | Tagged<"Brush", Brush.State>
    | Tagged<"Eraser", Brush.State>
    | Tagged<"Move", Camera.DragState | null>
    | Tagged<"Zoom", Camera.DragState | null>
    | Tagged<"Rotate", Camera.DragState | null>

export const enum EphemeralStateType {
    BrushState,
    EraserState,
    MoveState,
    ZoomState,
    RotateState,
}

export function initEphemeral(): State {
    return tagged("Brush", Brush.initTempState())
}

function syncEphemeral(tool: Config, ephemeral: State): State {
    if (ephemeral.tag === tool.current) {
        return ephemeral
    }
    switch (tool.current) {
        case "Brush":
            return tagged("Brush", Brush.initTempState())
        case "Eraser":
            return tagged("Eraser", Brush.initTempState())
        case "Move":
            return tagged("Move", null)
        case "Rotate":
            return tagged("Rotate", null)
        case "Zoom":
            return tagged("Zoom", null)
        default:
            const never: never = tool.current
            throw { "Unknown tool type: ": tool.current }
    }
}

export function getBlendMode(tool: Config): Blend.Mode {
    switch (tool.current) {
        case "Brush":
            return Blend.Mode.Normal
        case "Eraser":
            return Blend.Mode.Erase
        default:
            return Blend.Mode.Normal
    }
}

export function getSoftness(tool: Config): number {
    switch (tool.current) {
        case "Brush":
            return tool.brush.softness
        case "Eraser":
            return tool.eraser.softness
        default:
            return 0
    }
}
