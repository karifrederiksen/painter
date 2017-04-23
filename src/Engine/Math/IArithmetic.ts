
import { HasDefault, IEquality } from "../Common";

export interface ScalarArithmetic<T> {
	addScalar(rhs: number): T;
	subtractScalar(rhs: number): T;
	multiplyScalar(rhs: number): T;
	divideScalar(rhs: number): T;
	powScalar(rhs: number): T;
}

export interface TypeArithmetic<T> {
	add(rhs: T): T;
	subtract(rhs: T): T;
	multiply(rhs: T): T;
	divide(rhs: T): T;
}

export interface IArithmetic<T> extends ScalarArithmetic<T>, TypeArithmetic<T>, HasDefault<T>, IEquality<T> {
}


export function powiArith<T extends IArithmetic<T>>(val: T, n: number) {
	let result = val;
	while (n) {
		if (n & 1) {
			result = result.multiply(val)
		}
		n = n >> 1;
		val = val.multiply(val);
	}
	return val;
}

export const powTwoArith = <T extends IArithmetic<T>>(t: T) => powiArith<T>(t, 2);

export type InterpFunc<T> = (p: number) => T;

export function linearInterpolateFunc<T extends IArithmetic<T>>(start: T, end: T): InterpFunc<T> {
	const delta = end.subtract(start);
	return (percent: number) => start.add(delta.multiplyScalar(percent));
}