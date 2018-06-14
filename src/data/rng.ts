/*
  Pseudo-random number generator
  Meant for testing purposes, so I can get the same pattern every time I test something using random numbers.
  https://en.wikipedia.org/wiki/Xorshift
  Implementation of Xorshift 128
*/

export interface RngState {
    readonly x: number
    readonly y: number
    readonly z: number
    readonly w: number
}

function discardInitial(state: RngState, count: number): RngState {
    if (count > 0) {
        const { nextState } = next(state)
        return discardInitial(nextState, count - 1)
    }
    return state
}

export function seed(n: number, discardCount = 32): RngState {
    return discardInitial(
        {
            x: n,
            y: 0,
            z: 0,
            w: 0,
        },
        discardCount,
    )
}

export interface RngResult {
    readonly nextState: RngState
    readonly result: number
}

/* tslint:disable:no-bitwise */
export function next(state: RngState): RngResult {
    const t = state.x ^ (state.x << 11)
    const result = state.w ^ (state.w >> 19) ^ t ^ (t >> 8)

    return {
        result: result,
        nextState: {
            x: state.y,
            y: state.z,
            z: state.w,
            w: result,
        },
    }
}

export function nextInt(state: RngState): RngResult {
    const { nextState, result } = next(state)
    return {
        nextState,
        result: (result >>> 0) / ((1 << 30) * 2),
    }
}