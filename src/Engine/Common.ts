
export type Fun0<U> = () => U;
export type Fun1<T, U> = (t: T) => U;
export type Fun2<T0, T1, U> = (t0: T0, t1: T1) => U;
export type Fun3<T0, T1, T2, U> = (t0: T0, t1: T1, t2: T2) => U;

export type Action<T> = Fun1<T, void>;
export type Predicate<T> = Fun1<T, boolean>;


export interface HasDefault<T> {
	default(): T; // ?
	isDefault(): boolean;
}

export interface IEquality<T> {
	equals(t: T): boolean;
}

export interface MatchPattern<T, U> {
	some: (t: T) => U;
	none: () => U;
}
export interface ArrayMatchPattern<T, U> {
	some: (t: T[]) => U[];
	none: () => U[];
}

export interface MatchPatternSingle<T> {
	some: (t: T) => T;
	none: () => T;
}


export interface IOption<T> {
	value?: T;
	isSome: boolean;
	isNone: boolean;

	some(value?: T): IOption<T>;
	none(): IOption<T>;
	bind<U>(func: Fun1<T, IOption<U>>): IOption<U>;
	map<U>(func: Fun1<T, U>): IOption<U>;
	match<U>(pattern: MatchPattern<T, U>): U;
	valueOr(def: T): T;
}


export class Option<T> implements IOption<T> {
	private constructor(
		public value?: T
	) {
		Object.freeze(this);
	}

	public get isSome() { return this.value != null; }
	public get isNone() { return this.isSome === false; }

	public static some<T>(value?: T): Option<T> {
		return new Option<T>(value);
	}

	public static none<T>(): Option<T> { 
		return new Option<T>();
	}

	public static areSome<T>(arr: Option<T>[]) {
		return arr.every(o => o.isSome);
	}

	public static matchEvery<T, U>(arr: Option<T>[], pattern: ArrayMatchPattern<Option<T>, U>) {
		return Option.areSome(arr) ? pattern.some(arr) : pattern.none();
	}

	public some<T>(value?: T): Option<T> {
		return Option.some<T>();
	}

	public none<T>(): Option<T> {
		return Option.none<T>();
	}

	public bind<U>(func: Fun1<T, Option<U>>): Option<U> {
		return this.isSome ? func(this.value) : Option.none<U>();
	}

	public map<U>(func: Fun1<T, U>): Option<U> {
		return this.bind(value => Option.some<U>(func(value)));
	}

	public match<U>(pattern: MatchPattern<T, U>): U {
		return this.isSome ? pattern.some(this.value) : pattern.none();
	}

	public valueOr(def: T): T {
		return this.isSome ? this.value : def;
	}
}

export function average(numbers: number[]) {
	const total = numbers.reduce((a,b) => a + b, 0);
	return (numbers.length === 0) ? 0 : total / numbers.length;
}

export function andPreds<T>(predicated: Predicate<T>[]): Predicate<T> {
	return (e) => predicated.every(p => p(e));
}

export function orPreds<T>(predicated: Predicate<T>[]): Predicate<T> {
	return (e) => predicated.some(p => p(e));
}

export function isNumberType(value: any) {
	return isNaN(value) === false;
}

export function valueOr<T>(value: T, alternative: T) {
	return value != null ? value : alternative;
}