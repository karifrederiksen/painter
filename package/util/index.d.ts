import { Vec2 } from "./vec2";
export * as Store from "./store";
export * as Decode from "./decode";
export * from "./maybe";
export * from "./result";
export * from "./vec2";
export * from "./vec3";
export * from "./vec4";
export * as FrameStream from "./frameStream";
export * as PerfTracker from "./perfTracker";
export * as CanvasPool from "./canvasPool";
export * as Debug from "./debug";
export * as Bloomfilter from "./bloomFilter";
export type Tagged<a, v = null> = {
    readonly tag: a;
    readonly val: v;
};
export declare function tagged<a>(tag: a, val: void): Tagged<a, null>;
export declare function tagged<a, v>(tag: a, val: v): Tagged<a, v>;
export declare class Lazy<a> {
    private readonly __fn;
    private __isSet;
    private __value;
    constructor(__fn: () => a);
    force(): a;
}
export declare class SetOnce<a> {
    private __isSet;
    private __value;
    set(value: a): void;
    get value(): a;
}
export declare function orDefault<a>(value: a | undefined, def: a): a;
export declare function range(start: number, end: number): readonly number[];
export declare function distance(x0: number, y0: number, x1: number, y1: number): number;
export declare function lerp(pct: number, start: number, end: number): number;
export declare function smoothstep(x: number): number;
export declare function clamp(value: number, min: number, max: number): number;
export declare function delay(ms: number): Promise<void>;
export declare function stringToInt(text: string): number | null;
export declare function stringToFloat(text: string): number | null;
export interface PushOnlyArray<a> extends ReadonlyArray<a> {
    push(item: a): unknown;
}
export declare function arrUpdate<a>(array: readonly a[], index: number, value: a): readonly a[];
export declare function arrInsert<a>(array: readonly a[], index: number, value: a): readonly a[];
export declare function arrRemove<a>(array: readonly a[], index: number): readonly a[];
export declare const enum ColorMode {
    Hsv = 0,
    Hsluv = 1
}
export declare function colorModeToString(type: ColorMode): string;
export declare const Degrees: {
    fromNumber(x: number): Degrees;
    toNumber(x: Degrees): number;
};
export interface Degrees {
    __nominal: void;
}
export interface Turns {
    __nominal: void;
}
export declare const Turns: {
    fromNumber(x: number): Turns;
    toNumber(x: Turns): number;
};
export declare function turnsToDegrees(turns: Turns): Degrees;
export declare function turnsFromDegrees(degrees: Degrees): Turns;
export declare function turn(turns: number, center: Vec2, point: Vec2): Vec2;
export interface Pct {
    __nominal: void;
}
export declare const Pct: {
    fromNumber(x: number): Pct;
    toNumber(pct: Pct): number;
};
export interface Px {
    __nominal: void;
}
export declare const Px: {
    fromNumber(x: number): Px;
    toNumber(px: Px): number;
};
export interface Ms {
    __nominal: void;
}
export declare const Ms: {
    fromNumber(x: number): Px;
    toNumber(px: Px): number;
};
export declare class Position {
    readonly x: Px;
    readonly y: Px;
    constructor(x: Px, y: Px);
}
export declare class Size {
    readonly width: Px;
    readonly height: Px;
    constructor(width: Px, height: Px);
}
