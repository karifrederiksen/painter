import type { TransformedPointerInput } from "../canvas";
import { type Tagged, tagged } from "../util";

export interface DragState {
    readonly originalScale: number;
    readonly clickPoint: TransformedPointerInput;
    readonly prevPoint: TransformedPointerInput;
}

export type Msg =
    | Tagged<"SetZoom", { zoomPct: number }>
    | Tagged<"SetOffset", { offsetX: number; offsetY: number }>
    | Tagged<"SetRotation", { rotationTurns: number }>;

export class Sender {
    constructor(private sendMessage: (msg: Msg) => void) {}

    setRotation = (rotationTurns: number) =>
        this.sendMessage(tagged("SetRotation", { rotationTurns: rotationTurns }));
    setOffset = (offsetX: number, offsetY: number) =>
        this.sendMessage(tagged("SetOffset", { offsetX, offsetY }));
    setZoom = (zoomPct: number) => this.sendMessage(tagged("SetZoom", { zoomPct }));
}

export interface Config {
    readonly offsetX: number;
    readonly offsetY: number;
    readonly zoomPct: number;
    readonly rotateTurns: number;
}

export const init: Config = {
    offsetX: 0,
    offsetY: 0,
    zoomPct: 1,
    rotateTurns: 0,
};

export function update(state: Config, msg: Msg): Config {
    switch (msg.tag) {
        case "SetZoom":
            return { ...state, zoomPct: Math.max(0.01, msg.val.zoomPct) };
        case "SetOffset":
            return { ...state, offsetX: msg.val.offsetX, offsetY: msg.val.offsetY };
        case "SetRotation":
            return { ...state, rotateTurns: msg.val.rotationTurns };
        default: {
            const never: never = msg;
            throw { "unexpected msg": msg };
        }
    }
}

export function zoomUpdate(
    state: Config,
    dragState: DragState,
    input: TransformedPointerInput,
): Config {
    const xd = input.x - dragState.clickPoint.x;
    let addedPct = xd / 500;
    if (addedPct >= 0) {
        addedPct = addedPct ** 2;
    } else {
        addedPct = -((-addedPct) ** 2);
    }
    const zoomPct = dragState.originalScale + addedPct;
    return { ...state, zoomPct: Math.min(5000, zoomPct) };
}

export function rotateUpdate(
    state: Config,
    dragState: DragState,
    input: TransformedPointerInput,
): Config {
    throw new Error("todo: should be turns, not rad");
    // const rotationRad = Math.atan2(
    //     input.y - dragState.clickPoint.y,
    //     input.x - dragState.clickPoint.x
    // )
    // return new State(this.offsetX, this.offsetY, this.zoomPct, rotationRad)
}

export function moveUpdate(
    state: Config,
    dragState: DragState,
    input: TransformedPointerInput,
): Config {
    const xd = input.x - dragState.prevPoint.x;
    const yd = input.y - dragState.prevPoint.y;
    return { ...state, offsetX: state.offsetX + xd, offsetY: state.offsetY + yd };
}
