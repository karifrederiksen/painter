export declare class Vec2 {
    readonly x: number;
    readonly y: number;
    static zeroes: Vec2;
    constructor(x: number, y: number);
    eq(other: Vec2): boolean;
    add(other: Vec2): Vec2;
    addScalar(x: number): Vec2;
    addScalars(x: number, y: number): Vec2;
    subtract(other: Vec2): Vec2;
    subtractScalar(x: number): Vec2;
    subtractScalars(x: number, y: number): Vec2;
    multiply(other: Vec2): Vec2;
    multiplyScalar(x: number): Vec2;
    multiplyScalars(x: number, y: number): Vec2;
    divide(other: Vec2): Vec2;
    divideScalar(x: number): Vec2;
    toString(): string;
    static eq(l: Vec2, r: Vec2): boolean;
    static lerp(pct: number, begin: Vec2, end: Vec2): Vec2;
    static distance(l: Vec2, r: Vec2): number;
}
