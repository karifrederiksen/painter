export class Vec3 {
    x;
    y;
    z;
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    eq(other) {
        return Vec3.eq(this, other);
    }
    static eq(l, r) {
        return l.x === r.x && l.y === r.y && l.y === r.y;
    }
    static lerp(pct, begin, end) {
        return new Vec3(begin.x + (end.x - begin.x) * pct, begin.y + (end.y - begin.y) * pct, begin.z + (end.z - begin.z) * pct);
    }
}
