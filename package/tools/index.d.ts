import * as Brush from "./brush";
import * as Camera from "./camera";
import type * as BrushShader from "../canvas/brushShader";
import { Blend } from "../webgl";
import type { TransformedPointerInput } from "../canvas";
import { type Tagged } from "../util";
export type ToolMsg = Tagged<"SetToolMsg", ToolType> | Tagged<"BrushMsg", Brush.Msg> | Tagged<"EraserMsg", Brush.Msg> | Tagged<"CameraMsg", Camera.Msg>;
export declare class Sender {
    private sendMessage;
    readonly brush: Brush.Sender;
    readonly eraser: Brush.Sender;
    readonly camera: Camera.Sender;
    constructor(sendMessage: (msg: ToolMsg) => void);
    setTool: (type: ToolType) => void;
}
export type ToolType = "Brush" | "Eraser" | "Move" | "Zoom" | "Rotate";
export interface Config {
    readonly brush: Brush.Config;
    readonly eraser: Brush.Config;
    readonly camera: Camera.Config;
    readonly current: ToolType;
}
export declare const init: Config;
export declare function update(tool: Config, msg: ToolMsg): Config;
export declare function onClick(tool: Config, ephemeral_: State, pointer: TransformedPointerInput): readonly [Config, State, readonly BrushShader.BrushPoint[]];
export declare function onDrag(tool: Config, ephemeral_: State, pointers: readonly TransformedPointerInput[]): readonly [Config, State, readonly BrushShader.BrushPoint[]];
export declare function onRelease(tool: Config, ephemeral_: State, pointer: TransformedPointerInput): readonly [Config, State, readonly BrushShader.BrushPoint[]];
export declare function onFrame(tool: Config, state: State, currentTime: number): [State, readonly BrushShader.BrushPoint[]];
export type State = Tagged<"Brush", Brush.State> | Tagged<"Eraser", Brush.State> | Tagged<"Move", Camera.DragState | null> | Tagged<"Zoom", Camera.DragState | null> | Tagged<"Rotate", Camera.DragState | null>;
export declare const enum EphemeralStateType {
    BrushState = 0,
    EraserState = 1,
    MoveState = 2,
    ZoomState = 3,
    RotateState = 4
}
export declare function initEphemeral(): State;
export declare function getBlendMode(tool: Config): Blend.Mode;
export declare function getSoftness(tool: Config): number;
