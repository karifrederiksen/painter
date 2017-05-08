import { IArithmetic, Roundable } from "../Types";

export interface Vec2Args {
	x?: number;
	y?: number;
}

export class Vec2 implements IArithmetic<Vec2>, Roundable<Vec2> {
	public static readonly default = Object.freeze(new Vec2(0, 0));
	
	private constructor(
		public readonly x = 0.0,
		public readonly y = 0.0
	) { }

	
	public static create(x = 0, y = 0) {
		if (x === 0 && y === 0) {
			return Vec2.default;
		}
		return Object.freeze(new Vec2(x, y));
	}
	public default() {
		return Vec2.default;
	} 

	public set(args: Vec2Args) {
		return Vec2.create(
			args.x != null ? args.x : this.x,
			args.y != null ? args.y : this.y,
		);
	}
	
	public add(rhs: Vec2) { 
		return Vec2.create(
			this.x + rhs.x, 
			this.y + rhs.y
		);
	}
	public subtract(rhs: Vec2) {
		return Vec2.create(
			this.x - rhs.x, 
			this.y - rhs.y
		);
	}
	public multiply(rhs: Vec2) {
		return Vec2.create(
			this.x * rhs.x, 
			this.y * rhs.y
		);
	}
	public divide(rhs: Vec2) {
		return Vec2.create(
			this.x / rhs.x, 
			this.y / rhs.y
		);
	}
	public addScalar(n: number) {
		return Vec2.create(
			this.x + n, 
			this.y + n
		);
	} 
	public subtractScalar(n: number) {
		return Vec2.create(
			this.x - n, 
			this.y - n
		);
	}
	public multiplyScalar(n: number) {
		return Vec2.create(
			this.x * n, 
			this.y * n
		);
	}
	public divideScalar(n: number) {
		return Vec2.create(
			this.x / n, 
			this.y / n
		);
	}
	public powScalar(n: number) {
		return Vec2.create(
			Math.exp(Math.log(this.x) * n),
			Math.exp(Math.log(this.y) * n)
		);
	}

	public round() {
		return Vec2.create(
			(this.x + .5) | 0,
			(this.y + .5) | 0
		);
	}

	public floor() {
		return Vec2.create(
			this.x | 0,
			this.y | 0
		);
	}

	public ceil() {
		return Vec2.create(
			(this.x + 1) | 0,
			(this.y + 1) | 0
		);
	}

	public equals(rhs: Vec2) {
		return this.x === rhs.x 
			&& this.y === rhs.y;
	}

	public static distance (from: Vec2, to: Vec2) {
		return Math.sqrt((to.x - from.x) ** 2 + (to.y - from.y) ** 2);
	}
	public static angle (from: Vec2, to: Vec2) {
		return Math.atan2(to.y - from.y, to.x - from.y);
	}
	public static dot (lhs: Vec2, rhs: Vec2) {
		return lhs.x * rhs.x + lhs.y * rhs.y;
	}
}