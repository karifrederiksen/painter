import * as Input from "../input"
import { Case, Vec2 } from "../util"

export interface State {
    readonly offsetPx: Vec2
    readonly zoomPct: number
    readonly rotationRad: number
}

export const enum MsgType {
    SetZoom,
    SetOffset,
    SetRotation,
}

export type Msg =
    | Case<MsgType.SetZoom, number>
    | Case<MsgType.SetOffset, Vec2>
    | Case<MsgType.SetRotation, number>

export function init(): State {
    return {
        zoomPct: 1,
        offsetPx: new Vec2(0, 0),
        rotationRad: 0,
    }
}

export function update(state: State, msg: Msg): State {
    switch (msg.type) {
        case MsgType.SetZoom:
            return { ...state, zoomPct: msg.value }
        case MsgType.SetOffset:
            return { ...state, offsetPx: msg.value }
        case MsgType.SetRotation:
            return { ...state, rotationRad: msg.value }
    }
}

export interface MsgSender {
    setZoom(pct: number): void
    setOffset(xyPct: Vec2): void
    setRotation(pct: number): void
}

export function createSender(sendMessage: (msg: Msg) => void): MsgSender {
    return {
        setRotation: pct => sendMessage({ type: MsgType.SetRotation, value: pct }),
        setOffset: xyPct => sendMessage({ type: MsgType.SetOffset, value: xyPct }),
        setZoom: pct => sendMessage({ type: MsgType.SetZoom, value: pct }),
    }
}

export function zoomToolUpdate(
    camera: State,
    dragState: Input.DragState,
    input: Input.PointerInput
): Msg {
    const xd = input.x - dragState.prevPoint.x
    const zoomPct = camera.zoomPct + xd / 150
    return { type: MsgType.SetZoom, value: zoomPct }
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
    return { type: MsgType.SetRotation, value: rotationRad }
}

export function moveToolUpdate(
    camera: State,
    dragState: Input.DragState,
    input: Input.PointerInput
): Msg {
    const xd = input.x - dragState.prevPoint.x
    const yd = input.y - dragState.prevPoint.y
    const offset = new Vec2(camera.offsetPx.x + xd, camera.offsetPx.y + yd)
    return { type: MsgType.SetOffset, value: offset }
}
