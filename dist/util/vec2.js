export class Vec2 {
    x;
    y;
    static zeroes = new Vec2(0, 0);
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    eq(other) {
        return Vec2.eq(this, other);
    }
    add(other) {
        return new Vec2(this.x + other.x, this.y + other.y);
    }
    addScalar(x) {
        return new Vec2(this.x + x, this.y + x);
    }
    addScalars(x, y) {
        return new Vec2(this.x + x, this.y + y);
    }
    subtract(other) {
        return new Vec2(this.x - other.x, this.y - other.y);
    }
    subtractScalar(x) {
        return new Vec2(this.x - x, this.y - x);
    }
    subtractScalars(x, y) {
        return new Vec2(this.x - x, this.y - y);
    }
    multiply(other) {
        return new Vec2(this.x * other.x, this.y * other.y);
    }
    multiplyScalar(x) {
        return new Vec2(this.x * x, this.y * x);
    }
    multiplyScalars(x, y) {
        return new Vec2(this.x * x, this.y * y);
    }
    divide(other) {
        return new Vec2(this.x / other.x, this.y / other.y);
    }
    divideScalar(x) {
        return new Vec2(this.x / x, this.y / x);
    }
    toString() {
        return "Vec2(" + this.x + ", " + this.y + ")";
    }
    static eq(l, r) {
        return l.x === r.x && l.y === r.y;
    }
    static lerp(pct, begin, end) {
        return new Vec2(begin.x + (end.x - begin.x) * pct, begin.y + (end.y - begin.y) * pct);
    }
    static distance(l, r) {
        const x = r.x - l.x;
        const y = r.y - l.y;
        return Math.sqrt(x * x + y * y);
    }
}
