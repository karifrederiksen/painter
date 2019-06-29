import * as Input from "../input"

export interface State {
    readonly offsetX: number
    readonly offsetY: number
    readonly zoomPct: number
    readonly rotateTurns: number
}

export type Msg = SetZoomMsg | SetOffsetMsg | SetRotationMsg

export const enum MsgType {
    SetZoomMsg,
    SetOffsetMsg,
    SetRotationMsg,
}

class SetZoomMsg {
    readonly type: MsgType.SetZoomMsg = MsgType.SetZoomMsg
    private nominal: void
    constructor(readonly zoomPct: number) {}
}
class SetOffsetMsg {
    readonly type: MsgType.SetOffsetMsg = MsgType.SetOffsetMsg
    private nominal: void
    constructor(readonly offsetX: number, readonly offsetY: number) {}
}
class SetRotationMsg {
    readonly type: MsgType.SetRotationMsg = MsgType.SetRotationMsg
    private nominal: void
    constructor(readonly rotationRad: number) {}
}

export function init(): State {
    return {
        offsetX: 0,
        offsetY: 0,
        zoomPct: 1,
        rotateTurns: 0,
    }
}

export function update(state: State, msg: Msg): State {
    switch (msg.type) {
        case MsgType.SetZoomMsg:
            return { ...state, zoomPct: msg.zoomPct }
        case MsgType.SetOffsetMsg:
            return { ...state, offsetX: msg.offsetX, offsetY: msg.offsetY }
        case MsgType.SetRotationMsg:
            return { ...state, rotateTurns: msg.rotationRad }
        default:
            const never: never = msg
            throw { "unexpected msg": msg }
    }
}

export interface MsgSender {
    setZoom(pct: number): void
    setOffset(x: number, y: number): void
    setRotation(pct: number): void
}

export function createSender(sendMessage: (msg: Msg) => void): MsgSender {
    return {
        setRotation: pct => sendMessage(new SetRotationMsg(pct)),
        setOffset: (x, y) => sendMessage(new SetOffsetMsg(x, y)),
        setZoom: pct => sendMessage(new SetZoomMsg(pct)),
    }
}

export function zoomToolUpdate(
    camera: State,
    dragState: Input.DragState,
    input: Input.PointerInput
): Msg {
    const xd = input.x - dragState.prevPoint.x
    const zoomPct = camera.zoomPct + xd / 150
    return new SetZoomMsg(zoomPct)
}

export function rotateToolUpdate(
    _camera: State,
    dragState: Input.DragState,
    input: Input.PointerInput
): Msg {
    const rotationRad = Math.atan2(
        input.y - dragState.clickPoint.y,
        input.x - dragState.clickPoint.x
    )
    return new SetRotationMsg(rotationRad)
}

export function moveToolUpdate(
    camera: State,
    dragState: Input.DragState,
    input: Input.PointerInput
): Msg {
    const xd = input.x - dragState.prevPoint.x
    const yd = input.y - dragState.prevPoint.y
    return new SetOffsetMsg(camera.offsetX + xd, camera.offsetY + yd)
}
