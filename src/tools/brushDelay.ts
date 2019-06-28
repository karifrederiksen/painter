import { lerp } from "../util"

export interface Config {
    readonly duration: number
}

export const noDelay: Config = {
    duration: 0,
}

function easing(x: number): number {
    return x ** 0.92
}

export function delay(duration: number): Config {
    console.assert(duration >= 0, "Delay can't be negative")
    return { duration }
}

export interface Input {
    readonly x: number
    readonly y: number
    readonly pressure: number
}

function inputLerp(pct: number, start: Input, end: Input): Input {
    return {
        pressure: lerp(pct, start.pressure, end.pressure),
        x: lerp(pct, start.x, end.x),
        y: lerp(pct, start.y, end.y),
    }
}

export interface State {
    readonly startTime: number
    readonly start: Input
    readonly end: Input
}

export function init(currentTime: number, start: Input): State {
    return { startTime: currentTime, start, end: start }
}

export function updateWithInput(
    config: Config,
    state: State,
    currentTime: number,
    end: Input
): [State, Input] {
    if (config.duration === 0) {
        return [{ startTime: currentTime, start: end, end }, end]
    }
    const deltaTime = currentTime - state.startTime
    const pct = easing(Math.min(deltaTime / config.duration, 1))
    const output: Input = inputLerp(pct, state.start, end)
    return [{ startTime: currentTime, start: output, end }, output]
}

export function update(config: Config, state: State, currentTime: number): [State, Input] {
    const deltaTime = currentTime - state.startTime
    if (deltaTime >= config.duration) {
        return [state, state.end]
    }

    const pct = easing(Math.min(deltaTime / config.duration, 1))
    const output: Input = inputLerp(pct, state.start, state.end)
    return [state, output]
}
