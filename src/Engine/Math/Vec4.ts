import { IArithmetic } from "IVec";

export class Vec4 implements IArithmetic<Vec4> {
	public static readonly default = new Vec4(0, 0, 0, 0);

	private constructor(
		private _x = 0.0,
		private _y = 0.0,
		private _z = 0.0,
		private _w = 0.0
	) { 
		Object.freeze(this);
	}
	public get x() { return this._x; }
	public get y() { return this._y; }
	public get z() { return this._z; }
	public get w() { return this._w; }
	public get width()	{ return this.z; }
	public get height()	{ return this.w; }

	public static create(x: number, y: number, z: number, w: number) {
		if ([x,y,z,w].every(x => x === 0)) {
			return Vec4.default;
		}
		return new Vec4(x, y, z, w);
	}
	public default() {
		return Vec4.default;
	}
	public isDefault() {
		return this === Vec4.default;
	}

	public withXY(x: number, y: number)	{ return Vec4.create( x, y, this.z, this.w); }
	public wthZW(z: number, w: number)	{ return Vec4.create(this.x, this.y, z, w); }
	
	public add(rhs: Vec4) { 
		return Vec4.create(
			this._x + rhs._x, 
			this._y + rhs._y,
			this._z + rhs._z,
			this._w + rhs._w
			);
	}
	public subtract(rhs: Vec4) {
		return Vec4.create(
			this._x - rhs._x, 
			this._y - rhs._y,
			this._z - rhs._z,
			this._w - rhs._w
			);
	}
	public multiply(rhs: Vec4) {
		return Vec4.create(
			this._x * rhs._x, 
			this._y * rhs._y,
			this._z * rhs._z,
			this._w * rhs._w
			);
	}
	public divide(rhs: Vec4) {
		return Vec4.create(
			this._x / rhs._x, 
			this._y / rhs._y,
			this._z / rhs._z,
			this._w / rhs._w
		);
	}
	public addScalar(n: number) {
		return Vec4.create(
			this._x + n, 
			this._y + n,
			this._z + n,
			this._w + n
			);
	} 
	public subtractScalar(n: number) {
		return Vec4.create(
			this._x - n, 
			this._y - n,
			this._z - n,
			this._w - n
			);
	}
	public multiplyScalar(n: number) {
		return Vec4.create(
			this._x * n, 
			this._y * n,
			this._z * n,
			this._w * n
		);
	}
	public divideScalar(n: number) {
		return Vec4.create(
			this._x / n, 
			this._y / n,
			this._z / n,
			this._w / n
			);
	}
	public powScalar(n: number) {
		return Vec4.create(
			this._x ** n, 
			this._y ** n,
			this._z ** n,
			this._w ** n
			);
	}
}