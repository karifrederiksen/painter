export class Vec2 {
    static zeroes: Vec2 = new Vec2(0, 0)

    constructor(readonly x: number, readonly y: number) {}

    eq(other: Vec2): boolean {
        return Vec2.eq(this, other)
    }

    add(other: Vec2): Vec2 {
        return new Vec2(this.x + other.x, this.y + other.y)
    }

    addScalar(x: number): Vec2 {
        return new Vec2(this.x + x, this.y + x)
    }

    addScalars(x: number, y: number): Vec2 {
        return new Vec2(this.x + x, this.y + y)
    }

    subtract(other: Vec2): Vec2 {
        return new Vec2(this.x - other.x, this.y - other.y)
    }

    subtractScalar(x: number): Vec2 {
        return new Vec2(this.x - x, this.y - x)
    }

    subtractScalars(x: number, y: number): Vec2 {
        return new Vec2(this.x - x, this.y - y)
    }

    multiply(other: Vec2): Vec2 {
        return new Vec2(this.x * other.x, this.y * other.y)
    }

    multiplyScalar(x: number): Vec2 {
        return new Vec2(this.x * x, this.y * x)
    }

    multiplyScalars(x: number, y: number): Vec2 {
        return new Vec2(this.x * x, this.y * y)
    }

    divide(other: Vec2): Vec2 {
        return new Vec2(this.x / other.x, this.y / other.y)
    }

    divideScalar(x: number): Vec2 {
        return new Vec2(this.x / x, this.y / x)
    }

    toString(): string {
        return "Vec2(" + this.x + ", " + this.y + ")"
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
