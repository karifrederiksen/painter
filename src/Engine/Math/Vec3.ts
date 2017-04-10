import { IArithmetic } from "IVec";

export class Vec3 implements IArithmetic<Vec3> {
	public static readonly default = new Vec3(0, 0, 0);

	private constructor(
		private _x = 0.0,
		private _y = 0.0,
		private _z = 0.0
	) { 
		Object.freeze(this);
	}

	public get x() { return this._x; }
	public get y() { return this._y; }
	public get z() { return this._z; }

	public static create(x: number, y: number, z: number) { 
		if ([x, y, z].every(x => x === 0)) {
			return Vec3.default;
		}
		return new Vec3(x,y,z); 
	}
	public default() { 
		return Vec3.default; 
	}
	public isDefault() {
		return this === Vec3.default;
	}
	
	public withX(n: number) { Vec3.create(this.x + n, this.y, this.z); }
	public withY(n: number) { Vec3.create(this.x, this.y + n, this.z); }
	public withZ(n: number) { Vec3.create(this.x, this.y, this.z + n); }
	
	public add(rhs: Vec3) { 
		return Vec3.create(
			this._x + rhs._x, 
			this._y + rhs._y,
			this._z + rhs._z
			);
	}
	public subtract(rhs: Vec3) {
		return Vec3.create(
			this._x - rhs._x, 
			this._y - rhs._y,
			this._z - rhs._z
			);
	}
	public multiply(rhs: Vec3) {
		return Vec3.create(
			this._x * rhs._x, 
			this._y * rhs._y,
			this._z * rhs._z
			);
	}
	public divide(rhs: Vec3) {
		return Vec3.create(
			this._x / rhs._x, 
			this._y / rhs._y,
			this._z / rhs._z
		);
	}
	public addScalar(n: number) {
		return Vec3.create(
			this._x + n, 
			this._y + n,
			this._z + n
			);
	} 
	public subtractScalar(n: number) {
		return Vec3.create(
			this._x - n, 
			this._y - n,
			this._z - n
			);
	}
	public multiplyScalar(n: number) {
		return Vec3.create(
			this._x * n, 
			this._y * n,
			this._z * n
		);
	}
	public divideScalar(n: number) {
		return Vec3.create(
			this._x / n, 
			this._y / n,
			this._z / n
			);
	}
	public powScalar(n: number){ 
		return Vec3.create(
			this.x ** n, 
			this.y ** n, 
			this.z ** n
			); 
	}
	
	public round() { 
		return Vec3.create(
			this.x + .5 | 0, 
			this.y + .5 | 0, 
			this.z + .5 | 0
			); 
	}
}