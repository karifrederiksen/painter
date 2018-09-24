import { T2, T3 } from "./util"

/*
  Pseudo-random number generator
  Meant for testing purposes, so I can get the same pattern every time I test something using random numbers.
  https://en.wikipedia.org/wiki/Xorshift
  Implementation of Xorshift 128
*/

export interface State {
    readonly x: number
    readonly y: number
    readonly z: number
    readonly w: number
}

function discardInitial(state: State, count: number): State {
    if (count > 0) {
        const [_, nextState] = nextInt(state)
        return discardInitial(nextState, count - 1)
    }
    return state
}

export function seed(n: number, discardCount = 32): State {
    return discardInitial(
        {
            x: n,
            y: 0,
            z: 0,
            w: 0,
        },
        discardCount
    )
}

/* tslint:disable:no-bitwise */
export function nextInt(state: State): T2<number, State> {
    const t = state.x ^ (state.x << 11)
    const result = state.w ^ (state.w >> 19) ^ t ^ (t >> 8)

    return [
        result,
        {
            x: state.y,
            y: state.z,
            z: state.w,
            w: result,
        },
    ]
}

export function next2(state: State): T3<number, number, State> {
    const [first, state2] = next(state)
    const [second, state3] = next(state2)
    return [first, second, state3]
}

export function next(state: State): T2<number, State> {
    const [result, nextState] = nextInt(state)
    return [(result >>> 0) / ((1 << 30) * 2), nextState]
}

export class StatefulWrapper {
    private __state: State

    get state(): State {
        return this.__state
    }

    constructor(state: State) {
        this.__state = state
    }

    next(): number {
        const [result, nextState] = next(this.__state)
        this.__state = discardInitial(nextState, 32)
        return result
    }

    nextInt(): number {
        const [result, nextState] = nextInt(this.__state)
        this.__state = discardInitial(nextState, 32)
        return result
    }
}
