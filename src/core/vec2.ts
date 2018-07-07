export class Vec2 {
    constructor(readonly x: number, readonly y: number) {}

    eq(other: Vec2): boolean {
        return this.x === other.x && this.y === other.y
    }

    lerp(pct: number, end: Vec2): Vec2 {
        return new Vec2(this.x + (end.x - this.x) * pct, this.y + (end.y - this.y) * pct)
    }
}
