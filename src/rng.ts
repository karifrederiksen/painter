import { T2, T3, T4 } from "./util"

/*
  Pseudo-random number generator
  Meant for testing purposes, so I can get the same pattern every time I test something using random numbers.
  https://en.wikipedia.org/wiki/Xorshift
  Implementation of Xorshift 128
*/

export type Seed = T4<number, number, number, number>

export function seed(n: number): Seed {
    let seed_: Seed = [n, 0, 0, 0]
    for (let i = 0; i < 32; i++) {
        const [_, nextSeed] = nextInt(seed_)
        seed_ = nextSeed
    }
    return seed_
}

export function nextInt(state: Seed): T2<number, Seed> {
    const s = state[0]
    let t = state[3]
    t ^= t << 11
    t ^= t >>> 8
    t ^= s
    t ^= s >>> 19
    return [t, [t, s, state[1], state[2]]]
}

export function next(state: Seed): T2<number, Seed> {
    const [result, nextState] = nextInt(state)
    console.log(result)
    return [(result >>> 0) / ((1 << 30) * 2), nextState]
}

export function next2(state: Seed): T3<number, number, Seed> {
    const [first, state2] = next(state)
    const [second, state3] = next(state2)
    return [first, second, state3]
}

export function next3(state: Seed): T4<number, number, number, Seed> {
    const [first, state2] = next(state)
    const [second, state3] = next(state2)
    const [third, state4] = next(state3)
    return [first, second, third, state4]
}

export class StatefulWrapper {
    private __state: Seed

    get state(): Seed {
        return this.__state
    }

    constructor(state: Seed) {
        this.__state = state
    }

    next(): number {
        const [result, nextState] = next(this.__state)
        this.__state = nextState
        return result
    }

    nextInt(): number {
        const [result, nextState] = nextInt(this.__state)
        this.__state = nextState
        return result
    }
}
