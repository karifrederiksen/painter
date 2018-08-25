export const enum Order {
    LT = -1,
    EQ = 0,
    GT = 1,
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

export interface PushArray<T> extends ReadonlyArray<T> {
    push(...items: T[]): void
}

export interface StackArray<T> extends ReadonlyArray<T> {
    push(value: T): void
    pop(): T | undefined
}

export interface Case<identifier, state> {
    readonly type: identifier
    readonly state: state
}

export interface Msg<type, payload = undefined> {
    readonly type: type
    readonly payload: payload
}

export type Brand<a, brand> = a & { "@..brand": brand }
