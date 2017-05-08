import { IArithmetic, Roundable } from "../Types";

export interface Vec4Args {
	x?: number;
	y?: number;
	z?: number;
	w?: number;
}

export class Vec4 implements IArithmetic<Vec4>, Roundable<Vec4> {
	public static readonly default = Object.freeze(new Vec4(0, 0, 0, 0));

	private constructor(
		public readonly x = 0.0,
		public readonly y = 0.0,
		public readonly z = 0.0,
		public readonly w = 0.0
	) { 
		Object.freeze(this);
	}
	public get width()	{ return this.z; }
	public get height()	{ return this.w; }

	public static create(x: number, y: number, z: number, w: number) {
		if ([x,y,z,w].every(x => x === 0)) {
			return Vec4.default;
		}
		return Object.freeze(new Vec4(x, y, z, w));
	}
	public default() {
		return Vec4.default;
	}

	public equals(rhs: Vec4) {
		return this.x === rhs.x
			&& this.y === rhs.y
			&& this.z === rhs.y
			&& this.w === rhs.w;
	}

	public withXY(x: number, y: number)	{ 
		return Vec4.create( x, y, this.z, this.w);
	}
	public wthZW(z: number, w: number)	{ 
		return Vec4.create(this.x, this.y, z, w);
	}
	public set(args: Vec4Args) {
		return Vec4.create(
			args.x != null ? args.x : this.x,
			args.y != null ? args.y : this.y,
			args.z != null ? args.z : this.z,
			args.w != null ? args.w : this.w,
		);
	}
 	
	public add(rhs: Vec4) { 
		return Vec4.create(
			this.x + rhs.x, 
			this.y + rhs.y,
			this.z + rhs.z,
			this.w + rhs.w
		);
	}
	public subtract(rhs: Vec4) {
		return Vec4.create(
			this.x - rhs.x, 
			this.y - rhs.y,
			this.z - rhs.z,
			this.w - rhs.w
		);
	}
	public multiply(rhs: Vec4) {
		return Vec4.create(
			this.x * rhs.x, 
			this.y * rhs.y,
			this.z * rhs.z,
			this.w * rhs.w
		);
	}
	public divide(rhs: Vec4) {
		return Vec4.create(
			this.x / rhs.x, 
			this.y / rhs.y,
			this.z / rhs.z,
			this.w / rhs.w
		);
	}
	public addScalar(n: number) {
		return Vec4.create(
			this.x + n, 
			this.y + n,
			this.z + n,
			this.w + n
		);
	} 
	public subtractScalar(n: number) {
		return Vec4.create(
			this.x - n, 
			this.y - n,
			this.z - n,
			this.w - n
		);
	}
	public multiplyScalar(n: number) {
		return Vec4.create(
			this.x * n, 
			this.y * n,
			this.z * n,
			this.w * n
		);
	}
	public divideScalar(n: number) {
		return Vec4.create(
			this.x / n, 
			this.y / n,
			this.z / n,
			this.w / n
		);
	}
	public powScalar(n: number) {
		return Vec4.create(
			Math.exp(Math.log(this.x) * n),
			Math.exp(Math.log(this.y) * n),
			Math.exp(Math.log(this.z) * n),
			Math.exp(Math.log(this.w) * n)
		);
	}

	public round() {
		return Vec4.create(
			(this.x + .5) | 0,
			(this.y + .5) | 0,
			(this.z + .5) | 0,
			(this.w + .5) | 0
		);
	}

	public floor() {
		return Vec4.create(
			this.x | 0,
			this.y | 0,
			this.z | 0,
			this.w | 0
		);
	}

	public ceil() {
		return Vec4.create(
			(this.x + 1) | 0,
			(this.y + 1) | 0,
			(this.z + 1) | 0,
			(this.w + 1) | 0
		);
	}
}