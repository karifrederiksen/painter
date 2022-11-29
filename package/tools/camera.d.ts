import type { TransformedPointerInput } from "../canvas";
import { type Tagged } from "../util";
export interface DragState {
    readonly originalScale: number;
    readonly clickPoint: TransformedPointerInput;
    readonly prevPoint: TransformedPointerInput;
}
export type Msg = Tagged<"SetZoom", {
    zoomPct: number;
}> | Tagged<"SetOffset", {
    offsetX: number;
    offsetY: number;
}> | Tagged<"SetRotation", {
    rotationTurns: number;
}>;
export declare class Sender {
    private sendMessage;
    constructor(sendMessage: (msg: Msg) => void);
    setRotation: (rotationTurns: number) => void;
    setOffset: (offsetX: number, offsetY: number) => void;
    setZoom: (zoomPct: number) => void;
}
export interface Config {
    readonly offsetX: number;
    readonly offsetY: number;
    readonly zoomPct: number;
    readonly rotateTurns: number;
}
export declare const init: Config;
export declare function update(state: Config, msg: Msg): Config;
export declare function zoomUpdate(state: Config, dragState: DragState, input: TransformedPointerInput): Config;
export declare function rotateUpdate(state: Config, dragState: DragState, input: TransformedPointerInput): Config;
export declare function moveUpdate(state: Config, dragState: DragState, input: TransformedPointerInput): Config;
