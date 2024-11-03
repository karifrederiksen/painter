import type { RgbLinear } from "color";
export declare class Vec4 {
    readonly x: number;
    readonly y: number;
    readonly z: number;
    readonly w: number;
    constructor(x: number, y: number, z: number, w: number);
    eq(other: Vec4): boolean;
    static fromRgba(rgb: RgbLinear, alpha: number): Vec4;
    static eq(l: Vec4, r: Vec4): boolean;
}
