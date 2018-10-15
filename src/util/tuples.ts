export interface T0 extends Iterable<never> {
    readonly length: 0
    [Symbol.iterator](): Iterator<never>
}

export interface T1<a> extends Iterable<a> {
    readonly length: 1
    readonly [0]: a
    [Symbol.iterator](): Iterator<a>
}

export interface T2<a, b> extends Iterable<a | b> {
    readonly length: 2
    readonly [0]: a
    readonly [1]: b
    [Symbol.iterator](): Iterator<a | b>
}

export interface T3<a, b, c> extends Iterable<a | b | c> {
    readonly length: 3
    readonly [0]: a
    readonly [1]: b
    readonly [2]: c
    [Symbol.iterator](): Iterator<a | b | c>
}

export interface T4<a, b, c, d> extends Iterable<a | b | c | d> {
    readonly length: 4
    readonly [0]: a
    readonly [1]: b
    readonly [2]: c
    readonly [3]: d
    [Symbol.iterator](): Iterator<a | b | c | d>
}

export function t0(): T0 {
    return [] as T0
}

export function t1<a>(first: a): T1<a> {
    return [first]
}

export function t2<a, b>(first: a, second: b): T2<a, b> {
    return [first, second]
}

export function t3<a, b, c>(first: a, second: b, third: c): T3<a, b, c> {
    return [first, second, third]
}
