export class Vec4 {
    x;
    y;
    z;
    w;
    constructor(x, y, z, w) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
    eq(other) {
        return Vec4.eq(this, other);
    }
    static fromRgba(rgb, alpha) {
        return new Vec4(rgb.r * alpha, rgb.g * alpha, rgb.b * alpha, alpha);
    }
    static eq(l, r) {
        return l.x === r.x && l.y === r.y && l.z === r.z && l.w === r.w;
    }
}
