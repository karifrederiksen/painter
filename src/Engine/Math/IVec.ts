

export interface IArithmetic<T> {
	default(): T; // ?
	isDefault(): boolean;

	add(rhs: T): T;
	subtract(rhs: T): T;
	multiply(rhs: T): T;
	divide(rhs: T): T;

	addScalar(rhs: number): T;
	subtractScalar(rhs: number): T;
	multiplyScalar(rhs: number): T;
	divideScalar(rhs: number): T;
	powScalar(rhs: number): T;
}