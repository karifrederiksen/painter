import { Msg, Vec2 } from "canvas/util"
import { DragState, PointerInput } from "canvas"

export interface Camera {
    readonly offsetPx: Vec2
    readonly zoomPct: number
    readonly rotationRad: number
}

export const enum CameraMsgType {
    SetZoom,
    SetOffset,
    SetRotation,
}

export type CameraMsg =
    | Msg<CameraMsgType.SetZoom, number>
    | Msg<CameraMsgType.SetOffset, Vec2>
    | Msg<CameraMsgType.SetRotation, number>

export function init(): Camera {
    return {
        zoomPct: 1,
        offsetPx: new Vec2(0, 0),
        rotationRad: 0,
    }
}

export function update(state: Camera, msg: CameraMsg): Camera {
    switch (msg.type) {
        case CameraMsgType.SetZoom:
            return { ...state, zoomPct: msg.payload }
        case CameraMsgType.SetOffset:
            return { ...state, offsetPx: msg.payload }
        case CameraMsgType.SetRotation:
            return { ...state, rotationRad: msg.payload }
    }
}

export interface CameraMessageSender {
    setZoom(pct: number): void
    setOffset(xyPct: Vec2): void
    setRotation(pct: number): void
}

export function createCameraSender(sendMessage: (msg: CameraMsg) => void): CameraMessageSender {
    return {
        setRotation: pct => sendMessage({ type: CameraMsgType.SetRotation, payload: pct }),
        setOffset: xyPct => sendMessage({ type: CameraMsgType.SetOffset, payload: xyPct }),
        setZoom: pct => sendMessage({ type: CameraMsgType.SetZoom, payload: pct }),
    }
}

export function zoomToolUpdate(
    camera: Camera,
    dragState: DragState,
    input: PointerInput
): CameraMsg {
    const xd = input.x - dragState.prevPoint.x
    const zoomPct = camera.zoomPct + xd / 150
    return { type: CameraMsgType.SetZoom, payload: zoomPct }
}

export function rotateToolUpdate(
    _camera: Camera,
    dragState: DragState,
    input: PointerInput
): CameraMsg {
    const rotationRad = Math.atan2(
        input.y - dragState.clickPoint.y,
        input.x - dragState.clickPoint.x
    )
    return { type: CameraMsgType.SetRotation, payload: rotationRad }
}

export function moveToolUpdate(
    camera: Camera,
    dragState: DragState,
    input: PointerInput
): CameraMsg {
    const xd = input.x - dragState.prevPoint.x
    const yd = input.y - dragState.prevPoint.y
    const offset = new Vec2(camera.offsetPx.x + xd, camera.offsetPx.y + yd)
    return { type: CameraMsgType.SetOffset, payload: offset }
}
