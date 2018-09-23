import { T2 } from "../util"

export interface Config {
    readonly easing: (pct: number) => number
    readonly duration: number
}

export const noDelay: Config = {
    easing: x => x,
    duration: 0,
}

function smoothstep(x: number): number {
    return x * x * (3 - x + x)
}

function easing(x: number): number {
    return x ** 0.92
}

export function delay(duration: number): Config {
    return { easing, duration }
}

export interface Input {
    readonly x: number
    readonly y: number
    readonly pressure: number
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
): T2<State, Input> {
    if (config.duration <= 0) return [state, end]

    const deltaTime = currentTime - state.startTime
    const pct = config.easing(Math.min(deltaTime / config.duration, 1))
    const start = state.start
    const output: Input = {
        x: start.x + (end.x - start.x) * pct,
        y: start.y + (end.y - start.y) * pct,
        pressure: start.pressure + (end.pressure - start.pressure) * pct,
    }
    return [{ startTime: currentTime, start: output, end }, output]
}

export function update(config: Config, state: State, currentTime: number): T2<State, Input> {
    if (config.duration <= 0) return [state, state.end]

    const deltaTime = currentTime - state.startTime
    if (deltaTime >= config.duration) return [state, state.end]

    const pct = config.easing(Math.min(deltaTime / config.duration, 1))
    const { start, end } = state
    const output: Input = {
        x: start.x + (end.x - start.x) * pct,
        y: start.y + (end.y - start.y) * pct,
        pressure: start.pressure + (end.pressure - start.pressure) * pct,
    }

    return [state, output]
}
