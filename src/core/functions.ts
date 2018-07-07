export function invariant(condition: boolean, message: string): void
export function invariant(condition: boolean, message: () => string): void
export function invariant(condition: boolean, message: (() => string) | string): void {
    if (condition) {
        const msg = typeof message === "string" ? message : message()
        throw "Invariant violation: " + msg
    }
}

export function orDefault<a>(value: a | undefined, def: a): a {
    return value !== undefined ? value : def
}

export function range(start: number, end: number): ReadonlyArray<number> {
    const length = end - start
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
