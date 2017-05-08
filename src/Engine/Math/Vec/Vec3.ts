import { IArithmetic, Roundable } from "../Types";

export interface Vec3Args {
	x?: number;
	y?: number;
	z?: number;
}

export class Vec3 implements IArithmetic<Vec3>, Roundable<Vec3> {
	public static readonly default = Object.freeze(new Vec3(0, 0, 0));

	private constructor(
		public readonly x = 0.0,
		public readonly y = 0.0,
		public readonly z = 0.0
	) { }

	public static create(x: number, y: number, z: number) { 
		if ([x, y, z].every(x => x === 0)) {
			return Vec3.default;
		}
		return Object.freeze(new Vec3(x,y,z)); 
	}
	public default() { 
		return Vec3.default; 
	}

	public equals(rhs: Vec3) {
		return this.x === rhs.x
			&& this.y === rhs.y
			&& this.z === rhs.y;
	}
	
	public set(args: Vec3Args) {
		return Vec3.create(
			args.x != null ? args.x : this.x,
			args.y != null ? args.y : this.y,
			args.z != null ? args.z : this.z
		);
	}
	
	public add(rhs: Vec3) { 
		return Vec3.create(
			this.x + rhs.x, 
			this.y + rhs.y,
			this.z + rhs.z
		);
	}
	public subtract(rhs: Vec3) {
		return Vec3.create(
			this.x - rhs.x, 
			this.y - rhs.y,
			this.z - rhs.z
		);
	}
	public multiply(rhs: Vec3) {
		return Vec3.create(
			this.x * rhs.x, 
			this.y * rhs.y,
			this.z * rhs.z
		);
	}
	public divide(rhs: Vec3) {
		return Vec3.create(
			this.x / rhs.x, 
			this.y / rhs.y,
			this.z / rhs.z
		);
	}
	public addScalar(n: number) {
		return Vec3.create(
			this.x + n, 
			this.y + n,
			this.z + n
		);
	} 
	public subtractScalar(n: number) {
		return Vec3.create(
			this.x - n, 
			this.y - n,
			this.z - n
		);
	}
	public multiplyScalar(n: number) {
		return Vec3.create(
			this.x * n, 
			this.y * n,
			this.z * n
		);
	}
	public divideScalar(n: number) {
		return Vec3.create(
			this.x / n, 
			this.y / n,
			this.z / n
		);
	}
	public powScalar(n: number){ 
		return Vec3.create(
			Math.exp(Math.log(this.x) * n),
			Math.exp(Math.log(this.y) * n),
			Math.exp(Math.log(this.z) * n)
		); 
	}

	public round() {
		return Vec3.create(
			(this.x + .5) | 0,
			(this.y + .5) | 0,
			(this.z + .5) | 0
		);
	}

	public floor() {
		return Vec3.create(
			this.x | 0,
			this.y | 0,
			this.z | 0
		);
	}

	public ceil() {
		return Vec3.create(
			(this.x + 1) | 0,
			(this.y + 1) | 0,
			(this.z + 1) | 0
		);
	}
}