import { networkInterfaces } from "os"

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

export interface Action<type, payload = undefined> {
    readonly type: type
    readonly payload: payload
}

export type Brand<a, brand> = a & { "@..brand": brand }

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

export type Maybe<a> = T0 | T1<a>

export namespace Maybe {
    export function of<a>(val: a | null | undefined): Maybe<a> {
        if (val == null) return []
        return [val]
    }

    export function withDefault<a>(val: Maybe<a>, def: a): a {
        if (val.length === 0) return def
        return val[0]
    }

    export function withDefaultf<a>(val: Maybe<a>, def: () => a): a {
        if (val.length === 0) return def()
        return val[0]
    }

    export function map<a, b>(val: Maybe<a>, f: (val: a) => b): Maybe<b> {
        if (val.length === 0) return []
        return [f(val[0])]
    }

    export function map2<a, b, c>(
        val1: Maybe<a>,
        val2: Maybe<b>,
        f: (val1: a, val2: b) => c
    ): Maybe<c> {
        if (val1.length === 0 || val2.length === 0) return []
        return [f(val1[0], val2[0])]
    }

    export function map3<a, b, c, d>(
        val1: Maybe<a>,
        val2: Maybe<b>,
        val3: Maybe<c>,
        f: (val1: a, val2: b, val3: c) => d
    ): Maybe<d> {
        if (val1.length === 0 || val2.length === 0 || val3.length === 0) return []
        return [f(val1[0], val2[0], val3[0])]
    }

    export function andThen<a, b>(val: Maybe<a>, f: (val: a) => Maybe<b>): Maybe<b> {
        if (val.length === 0) return []
        return f(val[0])
    }
}

export type Result<ok, err> = T2<false, err> | T2<true, ok>

export namespace Result {
    export function isOk<ok, err>(res: Result<ok, err>): res is T2<true, ok> {
        return res[0]
    }
    export function isErr<ok, err>(res: Result<ok, err>): res is T2<false, err> {
        return !res[0]
    }

    export function ok<ok, err>(val: ok): Result<ok, err> {
        return [true, val]
    }

    export function err<ok, err>(val: err): Result<ok, err> {
        return [false, val]
    }

    export function map<ok, err, newOk>(
        res: Result<ok, err>,
        f: (val: ok) => newOk
    ): Result<newOk, err> {
        if (isOk(res)) {
            return [true, f(res[1])]
        } else {
            return [false, res[1]]
        }
    }

    export function mapErr<ok, err, newErr>(
        res: Result<ok, err>,
        f: (val: err) => newErr
    ): Result<ok, newErr> {
        if (isOk(res)) {
            return [true, res[1]]
        } else {
            return [false, f(res[1])]
        }
    }

    export function andThen<ok, err, newOk>(
        res: Result<ok, err>,
        f: (val: ok) => Result<newOk, err>
    ): Result<newOk, err> {
        if (isOk(res)) {
            return f(res[1])
        } else {
            return [false, res[1]]
        }
    }
}

export class Lazy<a> {
    private __value: a | null = null
    constructor(private readonly __fn: () => a) {}

    get value(): a {
        if (this.__value === null) {
            this.__value = this.__fn()
        }
        return this.__value
    }
}

export class SetOnce<a> {
    private __value: a | null = null

    set(value: a): void {
        if (this.__value !== null) throw "Attempted to re-set a SetOnce"
        this.__value = value
    }

    get value(): a {
        if (this.__value === null) throw "Attempted to get the value of a SetOnce before it was set"
        return this.__value
    }
}

export function orDefault<a>(value: a | undefined, def: a): a {
    return value !== undefined ? value : def
}

export function range(start: number, end: number): ReadonlyArray<number> {
    const length = end - start + 1
    const arr = new Array<number>(length)
    for (let i = 0; i < length; i++) {
        arr[i] = start + i
    }
    return arr
}

export function arrUpdate<a>(array: ReadonlyArray<a>, index: number, value: a): ReadonlyArray<a> {
    const newArr = array.slice()
    newArr.splice(index, 1, value)
    return newArr
}

export function arrInsert<a>(array: ReadonlyArray<a>, index: number, value: a): ReadonlyArray<a> {
    const newArr = array.slice()
    newArr.splice(index, 0, value)
    return newArr
}

export function arrRemove<a>(array: ReadonlyArray<a>, index: number): ReadonlyArray<a> {
    const newArr = array.slice()
    newArr.splice(index, 1)
    return newArr
}

export function distance(x0: number, y0: number, x1: number, y1: number): number {
    const x = x1 - x0
    const y = y1 - y0
    return Math.sqrt(x * x + y * y)
}

export function lerp(pct: number, start: number, end: number): number {
    return start + (end - start) * pct
}

export class Vec2 {
    constructor(readonly x: number, readonly y: number) {}

    eq(other: Vec2): boolean {
        return Vec2.eq(this, other)
    }
}

export namespace Vec2 {
    export function eq(l: Vec2, r: Vec2): boolean {
        return l.x === r.x && l.y === r.y
    }

    export function lerp(pct: number, begin: Vec2, end: Vec2): Vec2 {
        return new Vec2(begin.x + (end.x - begin.x) * pct, begin.y + (end.y - begin.y) * pct)
    }

    export function distance(l: Vec2, r: Vec2): number {
        const x = r.x - l.x
        const y = r.y - l.y
        return Math.sqrt(x * x + y * y)
    }
}

export class Vec3 {
    constructor(readonly x: number, readonly y: number, readonly z: number) {}

    eq(other: Vec3): boolean {
        return Vec3.eq(this, other)
    }
}

export namespace Vec3 {
    export function eq(l: Vec3, r: Vec3): boolean {
        return l.x === r.x && l.y === r.y && l.y === r.y
    }

    export function lerp(pct: number, begin: Vec3, end: Vec3): Vec3 {
        return new Vec3(
            begin.x + (end.x - begin.x) * pct,
            begin.y + (end.y - begin.y) * pct,
            begin.z + (end.z - begin.z) * pct
        )
    }
}
export class Vec4 {
    constructor(readonly x: number, readonly y: number, readonly z: number, readonly w: number) {}

    eq(other: Vec4): boolean {
        return Vec4.eq(this, other)
    }
}

export namespace Vec4 {
    export function eq(l: Vec4, r: Vec4): boolean {
        return l.x === r.x && l.y === r.y && l.z === r.z && l.w === r.w
    }
}

export interface FrameStream {
    (fn: (time: number) => void): CancelFrameStream
}

export interface CancelFrameStream {
    (): void
}

export const FrameStream = {
    make: (fn: (time: number) => void): CancelFrameStream => {
        let shouldStop = false
        ;(window as any)["painterStop"] = () => (shouldStop = true)

        const callback = () => {
            if (shouldStop) return
            try {
                fn(performance.now())
            } catch (e) {
                console.error(e)
            }
            requestId = requestAnimationFrame(callback)
        }
        let requestId = requestAnimationFrame(callback)
        return () => cancelAnimationFrame(requestId)
    },
}
