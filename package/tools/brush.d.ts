import * as Interp from "./interpolation";
import * as BrushDelay from "./brushDelay";
import type * as BrushShader from "../canvas/brushShader";
import type * as Camera from "./camera";
import * as Color from "color";
import { ColorMode, type Tagged } from "../util";
import { ZipperList } from "../collections/zipperList";
import type { TransformedPointerInput } from "../canvas";
export type Msg = Tagged<"SetDiameter", {
    diameterPx: number;
}> | Tagged<"SetSoftness", {
    softnessPct: number;
}> | Tagged<"SetOpacity", {
    opacityPct: number;
}> | Tagged<"SetColor", Color.Hsluv> | Tagged<"SetColorMode", ColorMode> | Tagged<"SetSpacing", {
    spacingPct: number;
}> | Tagged<"SetPressureAffectsOpacity", boolean> | Tagged<"SetPressureAffectsSize", boolean> | Tagged<"SwapColor"> | Tagged<"SetDelay", {
    delayMs: number;
}>;
export declare class Sender {
    private sendMessage;
    constructor(sendMessage: (msg: Msg) => void);
    setColor: (color: Color.Hsluv) => void;
    setColorMode: (mode: ColorMode) => void;
    setDelay: (delayMs: number) => void;
    setDiameter: (diameterPx: number) => void;
    setOpacity: (opacityPct: number) => void;
    setSoftness: (softnessPct: number) => void;
    setSpacing: (spacingPct: number) => void;
    setPressureAffectsOpacity: (setPressureAffectsOpacity: boolean) => void;
    setPressureAffectsSize: (setPressureAffectsSize: boolean) => void;
    swapColorFrom: () => void;
}
export type State = {
    readonly interpState: Interp.State;
    readonly delayState: BrushDelay.State;
} | null;
export declare function initTempState(): State;
export interface Config extends Interp.Config {
    readonly diameterPx: number;
    readonly softness: number;
    readonly flowPct: number;
    readonly colorMode: ZipperList<ColorMode>;
    readonly color: Color.Hsluv;
    readonly colorSecondary: Color.Hsluv;
    readonly spacingPct: number;
    readonly pressureAffectsOpacity: boolean;
    readonly pressureAffectsSize: boolean;
    readonly delay: BrushDelay.Config;
}
export declare const init: Config;
export declare function update(state: Config, msg: Msg): Config;
export declare function onClick(state: Config, camera: Camera.Config, input: TransformedPointerInput): [State, BrushShader.BrushPoint];
export declare function onDrag(state: Config, camera: Camera.Config, tempState: State, inputs: readonly TransformedPointerInput[]): [State, readonly BrushShader.BrushPoint[]];
export declare function onFrame(state: Config, ephState: State, currentTime: number): [State, readonly BrushShader.BrushPoint[]];
export declare function onRelease(): [State, readonly BrushShader.BrushPoint[]];
