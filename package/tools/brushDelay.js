import { lerp } from "../util/index.js";
export const noDelay = {
    duration: 0,
};
function easing(x) {
    return x ** 0.92;
}
export function delay(duration) {
    console.assert(duration >= 0, "Delay can't be negative");
    return { duration };
}
export class Input {
    x;
    y;
    pressure;
    constructor(x, y, pressure) {
        this.x = x;
        this.y = y;
        this.pressure = pressure;
    }
    lerp(pct, end) {
        return new Input(lerp(pct, this.x, end.x), lerp(pct, this.y, end.y), lerp(pct, this.pressure, end.pressure));
    }
}
export function init(currentTime, start) {
    return { startTime: currentTime, start, end: start };
}
export function updateWithInput(config, state, currentTime, end) {
    if (config.duration === 0) {
        return [{ startTime: currentTime, start: end, end }, end];
    }
    const deltaTime = currentTime - state.startTime;
    const pct = easing(Math.min(deltaTime / config.duration, 1));
    const output = state.start.lerp(pct, end);
    return [{ startTime: currentTime, start: output, end }, output];
}
export function update(config, state, currentTime) {
    const deltaTime = currentTime - state.startTime;
    if (deltaTime >= config.duration) {
        return [state, state.end];
    }
    const pct = easing(Math.min(deltaTime / config.duration, 1));
    const output = state.start.lerp(pct, state.end);
    return [state, output];
}
