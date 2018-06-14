import { T2, T3 } from "./types"

export * from "./color"
export * from "./result"
export * from "./rng"
export * from "./types"
export * from "./stack"
export * from "./vec2"
export * from "./vec4"

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
