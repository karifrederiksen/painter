export type Maybe<a> = readonly [] | readonly [a];

export function of<a>(val: a | null | undefined): Maybe<a> {
    if (val == null) return [];
    return [val];
}

export function withDefault<a>(val: Maybe<a>, def: a): a {
    if (val.length === 0) return def;
    return val[0];
}

export function withDefaultf<a>(val: Maybe<a>, def: () => a): a {
    if (val.length === 0) return def();
    return val[0];
}

export function map<a, b>(val: Maybe<a>, f: (val: a) => b): Maybe<b> {
    if (val.length === 0) return [];
    return [f(val[0])];
}

export function map2<a, b, c>(
    val1: Maybe<a>,
    val2: Maybe<b>,
    f: (val1: a, val2: b) => c,
): Maybe<c> {
    if (val1.length === 0 || val2.length === 0) return [];
    return [f(val1[0], val2[0])];
}

export function map3<a, b, c, d>(
    val1: Maybe<a>,
    val2: Maybe<b>,
    val3: Maybe<c>,
    f: (val1: a, val2: b, val3: c) => d,
): Maybe<d> {
    if (val1.length === 0 || val2.length === 0 || val3.length === 0) return [];
    return [f(val1[0], val2[0], val3[0])];
}

export function andThen<a, b>(val: Maybe<a>, f: (val: a) => Maybe<b>): Maybe<b> {
    if (val.length === 0) return [];
    return f(val[0]);
}
