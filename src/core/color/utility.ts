export function toLinear(val: number): number {
    return val ** 2.2
}

export function fromLinear(val: number): number {
    return val ** (1 / 2.2)
}
