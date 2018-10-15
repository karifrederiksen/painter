export class Vec2 {
    constructor(readonly x: number, readonly y: number) {}

    eq(other: Vec2): boolean {
        return Vec2.eq(this, other)
    }
}

export namespace Vec2 {
    export function eq(l: Vec2, r: Vec2): boolean {
        return l.x === r.x && l.y === r.y
    }

    export function lerp(pct: number, begin: Vec2, end: Vec2): Vec2 {
        return new Vec2(begin.x + (end.x - begin.x) * pct, begin.y + (end.y - begin.y) * pct)
    }

    export function distance(l: Vec2, r: Vec2): number {
        const x = r.x - l.x
        const y = r.y - l.y
        return Math.sqrt(x * x + y * y)
    }
}
