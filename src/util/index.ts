export { Store } from "./store"
export { Decode } from "./decode"
export * from "./tuples"
export * from "./maybe"
export * from "./result"
export * from "./vec2"
export * from "./vec3"
export * from "./vec4"
export * from "./frameStream"

export * from "./perfTracker"

export type Brand<a, brand> = a & { "@..brand": brand }

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

export function range(start: number, end: number): readonly number[] {
    const length = end - start + 1
    const arr = new Array<number>(length)
    for (let i = 0; i < length; i++) {
        arr[i] = start + i
    }
    return arr
}

export function distance(x0: number, y0: number, x1: number, y1: number): number {
    const x = x1 - x0
    const y = y1 - y0
    return Math.sqrt(x * x + y * y)
}

export function lerp(pct: number, start: number, end: number): number {
    return start + (end - start) * pct
}

export function smoothstep(x: number): number {
    return x * x * (3 - x + x)
}

export function clamp(min: number, max: number, n: number): number {
    return n < min ? min : n > max ? max : n
}

export function delay(ms: number): Promise<void> {
    return new Promise(res => {
        setTimeout(res, ms)
    })
}

export interface PushOnlyArray<a> extends ReadonlyArray<a> {
    push(item: a): unknown
}

export function arrUpdate<a>(array: readonly a[], index: number, value: a): readonly a[] {
    const newArr = array.slice()
    newArr.splice(index, 1, value)
    return newArr
}

export function arrInsert<a>(array: readonly a[], index: number, value: a): readonly a[] {
    const newArr = array.slice()
    newArr.splice(index, 0, value)
    return newArr
}

export function arrRemove<a>(array: readonly a[], index: number): readonly a[] {
    const newArr = array.slice()
    newArr.splice(index, 1)
    return newArr
}

export const enum ColorMode {
    Hsv,
    Hsluv,
}

export function colorModeToString(type: ColorMode): string {
    switch (type) {
        case ColorMode.Hsv:
            return "Hsv"
        case ColorMode.Hsluv:
            return "Hsluv"
    }
}
