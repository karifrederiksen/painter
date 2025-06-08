import type { RgbLinear } from "color";

export class Vec4 {
	readonly x: number;
	readonly y: number;
	readonly z: number;
	readonly w: number;
	constructor(x: number, y: number, z: number, w: number) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;
	}

	eq(other: Vec4): boolean {
		return Vec4.eq(this, other);
	}

	static fromRgba(rgb: RgbLinear, alpha: number): Vec4 {
		return new Vec4(rgb.r * alpha, rgb.g * alpha, rgb.b * alpha, alpha);
	}

	static eq(l: Vec4, r: Vec4): boolean {
		return l.x === r.x && l.y === r.y && l.z === r.z && l.w === r.w;
	}
}
