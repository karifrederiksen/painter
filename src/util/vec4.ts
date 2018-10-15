export class Vec4 {
    constructor(readonly x: number, readonly y: number, readonly z: number, readonly w: number) {}

    eq(other: Vec4): boolean {
        return Vec4.eq(this, other)
    }
}

export namespace Vec4 {
    export function eq(l: Vec4, r: Vec4): boolean {
        return l.x === r.x && l.y === r.y && l.z === r.z && l.w === r.w
    }
}
