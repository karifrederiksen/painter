import type * as Rng from "./rng.js";
export type GenResult<a> = readonly [a, Rng.Seed];
export interface Generators<a> {
    (rng: Rng.Seed): GenResult<a>;
}
export declare function always<a>(val: a): Generators<a>;
export declare function bool(rng: Rng.Seed): GenResult<boolean>;
export declare function int(min: number, max: number): Generators<number>;
export declare function float(min: number, max: number): Generators<number>;
export declare function t2<a, b>(genA: Generators<a>, genB: Generators<b>): Generators<[a, b]>;
export declare function t3<a, b, c>(genA: Generators<a>, genB: Generators<b>, genC: Generators<c>): Generators<[a, b, c]>;
export declare function array<a>(length: number, gen: Generators<a>): Generators<a[]>;
export type ObjectProps<a> = {
    readonly [propName in keyof a]: Generators<a[propName]>;
};
export declare function object<a>(gens: ObjectProps<a>): Generators<a>;
export declare function map<a, b>(genA: Generators<a>, f: (valA: a) => b): Generators<b>;
export declare function map2<a, b, c>(genA: Generators<a>, genB: Generators<b>, f: (valA: a, valB: b) => c): Generators<c>;
export declare function map3<a, b, c, d>(genA: Generators<a>, genB: Generators<b>, genC: Generators<c>, f: (valA: a, valB: b, valC: c) => d): Generators<d>;
export declare function map4<a, b, c, d, e>(genA: Generators<a>, genB: Generators<b>, genC: Generators<c>, genD: Generators<d>, f: (valA: a, valB: b, valC: c, valD: d) => e): Generators<e>;
export declare function andThen<a, b>(genA: Generators<a>, f: (val: a) => Generators<b>): Generators<b>;
export declare function lazy<a>(createGen: () => Generators<a>): Generators<a>;
