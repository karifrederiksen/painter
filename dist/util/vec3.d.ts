export declare class Vec3 {
    readonly x: number;
    readonly y: number;
    readonly z: number;
    constructor(x: number, y: number, z: number);
    eq(other: Vec3): boolean;
    static eq(l: Vec3, r: Vec3): boolean;
    static lerp(pct: number, begin: Vec3, end: Vec3): Vec3;
}
