import type * as BrushShader from "../canvas/brushShader";
import type * as Color from "color";
import { Vec2 } from "../util";
export interface Config {
    readonly diameterPx: number;
    readonly spacingPct: number;
}
export interface InputPoint {
    readonly alpha: number;
    readonly color: Color.RgbLinear;
    readonly position: Vec2;
    readonly pressure: number;
    readonly rotation: number;
}
export interface State {
    readonly prevPoint: InputPoint;
}
export declare function init(prevPoint: InputPoint): State;
export declare function interpolate(state: State, brush: Config, end: InputPoint): [State, readonly BrushShader.BrushPoint[]];
