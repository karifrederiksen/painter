import { Camera, CameraMsg, CameraMsgType } from "./camera"
import { DragState, PointerInput } from "canvas/input"
import { Vec2 } from "core"

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
