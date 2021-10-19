import { TransformedPointerInput } from "../canvas"

export interface DragState {
    readonly originalScale: number
    readonly clickPoint: TransformedPointerInput
    readonly prevPoint: TransformedPointerInput
}

export type Msg = SetZoomMsg | SetOffsetMsg | SetRotationMsg

export const enum MsgType {
    SetZoomMsg,
    SetOffsetMsg,
    SetRotationMsg,
}

class SetZoomMsg {
    readonly type: MsgType.SetZoomMsg = MsgType.SetZoomMsg
    constructor(readonly zoomPct: number) {}
}
class SetOffsetMsg {
    readonly type: MsgType.SetOffsetMsg = MsgType.SetOffsetMsg
    constructor(readonly offsetX: number, readonly offsetY: number) {}
}
class SetRotationMsg {
    readonly type: MsgType.SetRotationMsg = MsgType.SetRotationMsg
    constructor(readonly rotationTurns: number) {}
}

export class MsgSender {
    constructor(private sendMessage: (msg: Msg) => void) {}

    readonly setRotation = (pct: number) => {
        this.sendMessage(new SetRotationMsg(pct))
    }
    readonly setOffset = (x: number, y: number) => {
        this.sendMessage(new SetOffsetMsg(x, y))
    }
    readonly setZoom = (pct: number) => {
        this.sendMessage(new SetZoomMsg(pct))
    }
}

export interface Config {
    readonly offsetX: number
    readonly offsetY: number
    readonly zoomPct: number
    readonly rotateTurns: number
}

export const init: Config = {
    offsetX: 0,
    offsetY: 0,
    zoomPct: 1,
    rotateTurns: 0,
}

export function update(state: Config, msg: Msg): Config {
    switch (msg.type) {
        case MsgType.SetZoomMsg:
            return { ...state, zoomPct: Math.max(0.01, msg.zoomPct) }
        case MsgType.SetOffsetMsg:
            return { ...state, offsetX: msg.offsetX, offsetY: msg.offsetY }
        case MsgType.SetRotationMsg:
            return { ...state, rotateTurns: msg.rotationTurns }
        default:
            const never: never = msg
            throw { "unexpected msg": msg }
    }
}

export function zoomUpdate(
    state: Config,
    dragState: DragState,
    input: TransformedPointerInput
): Config {
    const xd = input.x - dragState.clickPoint.x
    let addedPct = xd / 500
    if (addedPct >= 0) {
        addedPct = addedPct ** 2
    } else {
        addedPct = -((-addedPct) ** 2)
    }
    const zoomPct = dragState.originalScale + addedPct
    return { ...state, zoomPct: Math.min(5000, zoomPct) }
}

export function rotateUpdate(
    state: Config,
    dragState: DragState,
    input: TransformedPointerInput
): Config {
    throw "todo: should be turns, not rad"
    // const rotationRad = Math.atan2(
    //     input.y - dragState.clickPoint.y,
    //     input.x - dragState.clickPoint.x
    // )
    // return new State(this.offsetX, this.offsetY, this.zoomPct, rotationRad)
}

export function moveUpdate(
    state: Config,
    dragState: DragState,
    input: TransformedPointerInput
): Config {
    const xd = input.x - dragState.prevPoint.x
    const yd = input.y - dragState.prevPoint.y
    return { ...state, offsetX: state.offsetX + xd, offsetY: state.offsetY + yd }
}
