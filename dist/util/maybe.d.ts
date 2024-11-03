export type Maybe<a> = readonly [] | readonly [a];
export declare function of<a>(val: a | null | undefined): Maybe<a>;
export declare function withDefault<a>(val: Maybe<a>, def: a): a;
export declare function withDefaultf<a>(val: Maybe<a>, def: () => a): a;
export declare function map<a, b>(val: Maybe<a>, f: (val: a) => b): Maybe<b>;
export declare function map2<a, b, c>(val1: Maybe<a>, val2: Maybe<b>, f: (val1: a, val2: b) => c): Maybe<c>;
export declare function map3<a, b, c, d>(val1: Maybe<a>, val2: Maybe<b>, val3: Maybe<c>, f: (val1: a, val2: b, val3: c) => d): Maybe<d>;
export declare function andThen<a, b>(val: Maybe<a>, f: (val: a) => Maybe<b>): Maybe<b>;
