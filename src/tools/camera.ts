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

export class State {
    static init: State = new State(0, 0, 1, 0)
    private nominal: void
    readonly offsetX: number
    readonly offsetY: number
    readonly zoomPct: number
    readonly rotateTurns: number

    private constructor(offsetX: number, offsetY: number, zoomPct: number, rotateTurns: number) {
        this.offsetX = offsetX
        this.offsetY = offsetY
        this.zoomPct = Math.max(0.01, zoomPct)
        this.rotateTurns = rotateTurns
    }

    update(msg: Msg): State {
        switch (msg.type) {
            case MsgType.SetZoomMsg:
                return new State(this.offsetX, this.offsetY, msg.zoomPct, this.rotateTurns)
            case MsgType.SetOffsetMsg:
                return new State(msg.offsetX, msg.offsetY, this.zoomPct, this.rotateTurns)
            case MsgType.SetRotationMsg:
                return new State(this.offsetX, this.offsetY, this.zoomPct, msg.rotationTurns)
            default:
                const never: never = msg
                throw { "unexpected msg": msg }
        }
    }

    zoomUpdate(dragState: DragState, input: TransformedPointerInput): State {
        const xd = input.x - dragState.clickPoint.x
        let addedPct = xd / 500
        if (addedPct >= 0) {
            addedPct = addedPct ** 2
        } else {
            addedPct = -((-addedPct) ** 2)
        }
        const zoomPct = dragState.originalScale + addedPct
        console.log({
            originalScale: dragState.originalScale,
            clickX: dragState.clickPoint.x,
            x: input.originalX,
            addedPct: addedPct,
        })
        return new State(this.offsetX, this.offsetY, Math.min(5000, zoomPct), this.rotateTurns)
    }

    rotateUpdate(dragState: DragState, input: TransformedPointerInput): State {
        throw "todo: should be turns, not rad"
        // const rotationRad = Math.atan2(
        //     input.y - dragState.clickPoint.y,
        //     input.x - dragState.clickPoint.x
        // )
        // return new State(this.offsetX, this.offsetY, this.zoomPct, rotationRad)
    }

    moveUpdate(dragState: DragState, input: TransformedPointerInput): State {
        const xd = input.x - dragState.prevPoint.x
        const yd = input.y - dragState.prevPoint.y
        return new State(this.offsetX + xd, this.offsetY + yd, this.zoomPct, this.rotateTurns)
    }
}
