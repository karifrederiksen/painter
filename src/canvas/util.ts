export const enum Order {
    LT = -1,
    EQ = 0,
    GT = 1,
}

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

export function t2<a, b>(first: a, second: b): T2<a, b> {
    return [first, second]
}

export function t3<a, b, c>(first: a, second: b, third: c): T3<a, b, c> {
    return [first, second, third]
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
        return this.x === other.x && this.y === other.y
    }

    lerp(pct: number, end: Vec2): Vec2 {
        return new Vec2(this.x + (end.x - this.x) * pct, this.y + (end.y - this.y) * pct)
    }
}

export class Vec3 {
    constructor(readonly x: number, readonly y: number, readonly z: number) {}

    eq(other: Vec3): boolean {
        return this.x === other.x && this.y === other.y && this.z === other.z
    }

    lerp(pct: number, end: Vec3): Vec3 {
        return new Vec3(
            this.x + (end.x - this.x) * pct,
            this.y + (end.y - this.y) * pct,
            this.z + (end.z - this.z) * pct
        )
    }
}

export class Vec4 {
    constructor(readonly x: number, readonly y: number, readonly z: number, readonly w: number) {}

    eq(other: Vec4): boolean {
        return this.x === other.x && this.y === other.y && this.z === other.z && this.w === other.w
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
        const callback = () => {
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
