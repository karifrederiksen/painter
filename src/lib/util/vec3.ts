export class Vec3 {
    constructor(readonly x: number, readonly y: number, readonly z: number) {}

    eq(other: Vec3): boolean {
        return Vec3.eq(this, other);
    }
    static eq(l: Vec3, r: Vec3): boolean {
        return l.x === r.x && l.y === r.y && l.y === r.y;
    }

    static lerp(pct: number, begin: Vec3, end: Vec3): Vec3 {
        return new Vec3(
            begin.x + (end.x - begin.x) * pct,
            begin.y + (end.y - begin.y) * pct,
            begin.z + (end.z - begin.z) * pct,
        );
    }
}
