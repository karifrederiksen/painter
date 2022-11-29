import type * as Camera from "./camera.js";
export interface TransformedPointerInput {
    readonly x: number;
    readonly y: number;
    readonly pressure: number;
    readonly originalX: number;
    readonly originalY: number;
    readonly time: number;
}
export interface Tool<ephemeral, effect> {
    onClick(camera: Camera.Config, input: TransformedPointerInput): [ephemeral, effect];
}
