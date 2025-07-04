import { clamp } from "./functions";

export class v2 {
	static zero() {
		return new v2(0, 0);
	}
	static x(x: number) {
		return new v2(x, 0);
	}
	static y(y: number) {
		return new v2(0, y);
	}
	static xy(x: number, y: number) {
		return new v2(x, y);
	}

	static eq(l: v2, r: v2): boolean {
		return l.x === r.x && l.y === r.y;
	}

	static lerp(pct: number, begin: v2, end: v2): v2 {
		return new v2(
			begin.x + (end.x - begin.x) * pct,
			begin.y + (end.y - begin.y) * pct,
		);
	}

	static distance(l: v2, r: v2): number {
		const x = r.x - l.x;
		const y = r.y - l.y;
		return Math.sqrt(x * x + y * y);
	}

	private constructor(
		readonly x: number,
		readonly y: number,
	) {}
	eq(other: v2): boolean {
		return v2.eq(this, other);
	}

	add(r: v2): v2 {
		return new v2(this.x + r.x, this.y + r.y);
	}

	sub(r: v2): v2 {
		return new v2(this.x - r.x, this.y - r.y);
	}

	mul(r: v2): v2 {
		return new v2(this.x * r.x, this.y * r.y);
	}

	div(r: v2): v2 {
		return new v2(this.x / r.x, this.y / r.y);
	}

	addNum(r: number): v2 {
		return new v2(this.x + r, this.y + r);
	}

	subNum(r: number): v2 {
		return new v2(this.x - r, this.y - r);
	}

	mulNum(r: number): v2 {
		return new v2(this.x * r, this.y * r);
	}

	divNum(r: number): v2 {
		return new v2(this.x / r, this.y / r);
	}

	clampNum(min: number, max: number): v2 {
		const x = clamp(this.x, min, max);
		const y = clamp(this.y, min, max);
		if (this.x === x && this.y === y) {
			return this;
		}
		return new v2(x, y);
	}

	dot(): number {
		return this.x * this.x + this.y * this.y;
	}

	length(): number {
		return Math.sqrt(this.dot());
	}

	rotate(radians: number): v2 {
		const { x, y } = this;
		const s = Math.sin(radians);
		const c = Math.cos(radians);
		return new v2(x * c - y * s, x * s + y * c);
	}

	turn(pct: number): v2 {
		return this.rotate(pct * Math.PI * 2);
	}
}
