import { Vec2, Msg } from "../../../core"

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
