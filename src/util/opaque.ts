declare interface Symbols {
	readonly base: unique symbol;
	readonly brand: unique symbol;
}
declare const Symbols: Symbols;

export type Opaque<Base, Brand> = Base & {
	readonly [Symbols.base]: Base;
	readonly [Symbols.brand]: Brand;
};

export type OpaqueBase<A extends Opaque<unknown, unknown>> =
	A[typeof Symbols.base];

export type OpaqueBrand<A extends Opaque<unknown, unknown>> =
	A[typeof Symbols.brand];

export function narrow<Op extends Opaque<unknown, unknown>>(
	value: OpaqueBase<Op>,
): Op;
export function narrow<Base, Brand>(value: Base): Opaque<Base, Brand>;
export function narrow<Base, Brand>(value: Base): Opaque<Base, Brand> {
	return value as Opaque<Base, Brand>;
}

export function createConstructor<Op extends Opaque<unknown, unknown>>(): (
	value: OpaqueBase<Op>,
) => Opaque<OpaqueBase<Op>, OpaqueBrand<Op>>;
export function createConstructor<Base, Brand>(): (
	value: Base,
) => Opaque<Base, Brand>;
export function createConstructor<Base, Brand>(): (
	value: Base,
) => Opaque<Base, Brand> {
	return (value) => value as Opaque<Base, Brand>;
}

export function widen<A extends Opaque<unknown, unknown>>(
	value: A,
): OpaqueBase<A> {
	return value;
}
