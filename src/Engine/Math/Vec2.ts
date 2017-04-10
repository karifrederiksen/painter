import { IArithmetic } from "IVec";

export class Vec2 implements IArithmetic<Vec2> {
	public static readonly default = new Vec2(0, 0);
	
	private constructor(
		private _x = 0.0,
		private _y = 0.0
	) { 
		Object.freeze(this);
	}

	public get x() { return this._x; }
	public get y() { return this._y; }

	
	public static create = (x = 0, y = 0) => {
		if (x === 0 && y === 0) {
			return Vec2.default;
		}
		return new Vec2(x, y);
	}
	public default() {
		return Vec2.default;
	} 
	public isDefault() {
		return this === Vec2.default;
	}

	public withX(n: number) {
		return Vec2.create(n, this._y);
	}
	public withY(n: number) {
		return Vec2.create(this._x, n);
	}
	
	public add(rhs: Vec2) { 
		return Vec2.create(
			this._x + rhs._x, 
			this._y + rhs._y
			);
	}
	public subtract(rhs: Vec2) {
		return Vec2.create(
			this._x - rhs._x, 
			this._y - rhs._y
			);
	}
	public multiply(rhs: Vec2) {
		return Vec2.create(
			this._x * rhs._x, 
			this._y * rhs._y
			);
	}
	public divide(rhs: Vec2) {
		return Vec2.create(
			this._x / rhs._x, 
			this._y / rhs._y
		);
	}
	public addScalar(n: number) {
		return Vec2.create(
			this._x + n, 
			this._y + n
			);
	} 
	public subtractScalar(n: number) {
		return Vec2.create(
			this._x - n, 
			this._y - n
			);
	}
	public multiplyScalar(n: number) {
		return Vec2.create(
			this._x * n, 
			this._y * n
		);
	}
	public divideScalar(n: number) {
		return Vec2.create(
			this._x / n, 
			this._y / n
			);
	}
	public powScalar(n: number) {
		return Vec2.create(
			this._x ** n, 
			this._y ** n
			);
	}

	public equal(rhs: Vec2) {
		return this._x === rhs._x 
			&& this._y === rhs._y;
	}

	public static distance (from: Vec2, to: Vec2) {
		return Math.sqrt((to._x - from._x) ** 2 + (to._y - from._y) ** 2);
	}
	public static angle (from: Vec2, to: Vec2) {
		return Math.atan2(to._y - from._y, to._x - from._y);
	}
	public static dot (lhs: Vec2, rhs: Vec2) {
		return lhs._x * rhs._x + lhs._y * rhs._y;
	}
}