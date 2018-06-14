import { Vec2, Msg } from "../../../data"

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
