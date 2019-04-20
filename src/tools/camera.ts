import * as Input from "../input"
import { Vec2 } from "../util"

export interface State {
    readonly offsetPx: Vec2
    readonly zoomPct: number
    readonly rotationRad: number
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
    constructor(readonly offsetPx: Vec2) {}
}
class SetRotationMsg {
    readonly type: MsgType.SetRotationMsg = MsgType.SetRotationMsg
    private nominal: void
    constructor(readonly rotationRad: number) {}
}

export function init(): State {
    return {
        zoomPct: 1,
        offsetPx: new Vec2(0, 0),
        rotationRad: 0,
    }
}

export function update(state: State, msg: Msg): State {
    switch (msg.type) {
        case MsgType.SetZoomMsg:
            return { ...state, zoomPct: msg.zoomPct }
        case MsgType.SetOffsetMsg:
            return { ...state, offsetPx: msg.offsetPx }
        case MsgType.SetRotationMsg:
            return { ...state, rotationRad: msg.rotationRad }
        default:
            const never: never = msg
            throw { "unexpected msg": msg }
    }
}

export interface MsgSender {
    setZoom(pct: number): void
    setOffset(xyPct: Vec2): void
    setRotation(pct: number): void
}

export function createSender(sendMessage: (msg: Msg) => void): MsgSender {
    return {
        setRotation: pct => sendMessage(new SetRotationMsg(pct)),
        setOffset: xyPx => sendMessage(new SetOffsetMsg(xyPx)),
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
    const offset = new Vec2(camera.offsetPx.x + xd, camera.offsetPx.y + yd)
    return new SetOffsetMsg(offset)
}
