import { PointerInput } from "./inputListener"

export { PointerInput, listen as listenToPointers, RemoveListeners } from "./inputListener"

export interface DragState {
    readonly clickPoint: PointerInput
    readonly prevPoint: PointerInput
}
