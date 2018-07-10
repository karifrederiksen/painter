import { T2 } from "core"

export interface DelayConfig {
    readonly easing: (pct: number) => number
    readonly duration: number
}

export const noDelay: DelayConfig = {
    easing: x => x,
    duration: 0,
}

function smoothstep(x: number): number {
    return x * x * (3 - x + x)
}

function easing(x: number): number {
    return x ** 0.92
}

export function delay(duration: number): DelayConfig {
    return { easing, duration }
}

export interface BrushInput {
    readonly x: number
    readonly y: number
    readonly pressure: number
}

export interface DelayState {
    readonly startTime: number
    readonly start: BrushInput
    readonly end: BrushInput
}

export function init(currentTime: number, start: BrushInput): DelayState {
    return { startTime: currentTime, start, end: start }
}

export function updateWithInput(
    config: DelayConfig,
    state: DelayState,
    currentTime: number,
    end: BrushInput
): T2<DelayState, BrushInput> {
    if (config.duration <= 0) return [state, end]

    const deltaTime = currentTime - state.startTime
    const pct = config.easing(Math.min(deltaTime / config.duration, 1))
    const start = state.start
    const output: BrushInput = {
        x: start.x + (end.x - start.x) * pct,
        y: start.y + (end.y - start.y) * pct,
        pressure: start.pressure + (end.pressure - start.pressure) * pct,
    }
    return [{ startTime: currentTime, start: output, end }, output]
}

export function update(
    config: DelayConfig,
    state: DelayState,
    currentTime: number
): T2<DelayState, BrushInput> {
    if (config.duration <= 0) return [state, state.end]

    const deltaTime = currentTime - state.startTime
    if (deltaTime >= config.duration) return [state, state.end]

    const pct = config.easing(Math.min(deltaTime / config.duration, 1))
    const { start, end } = state
    const output: BrushInput = {
        x: start.x + (end.x - start.x) * pct,
        y: start.y + (end.y - start.y) * pct,
        pressure: start.pressure + (end.pressure - start.pressure) * pct,
    }

    return [state, output]
}
