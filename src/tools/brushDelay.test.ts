import test from "ava"
import * as Delay from "./brushDelay"

function mkInput(x: number, y: number, pressure: number): Delay.Input {
    return new Delay.Input(x, y, pressure)
}

const state: Delay.State = { startTime: 0, start: mkInput(0, 0, 0), end: mkInput(100, 100, 1) }

test("(update) should produce state.end when delay is 0", t => {
    for (let time = 0; time < 10; time++) {
        t.deepEqual(Delay.update(Delay.delay(0), state, time)[1], state.end)
    }
})

test("(update) should produce state.start when time is equal to startTime", t => {
    t.deepEqual(Delay.update(Delay.delay(1), state, state.startTime)[1], state.start)
})

test("(update) should produce state.end when time is greater than or equal to (startTime + delay)", t => {
    for (let delay = 0; delay < 10; delay++) {
        for (let time = 0; time < 10; time++) {
            const startTime = state.startTime + time + delay
            t.deepEqual(Delay.update(Delay.delay(delay), state, startTime)[1], state.end)
        }
    }
})

test("(update) update should produce values between start and end when time is between (startTime) and (startTime + delay)", t => {
    // we can't test for the absolute values since the easing function's implementation should remain flexible.

    const delay = Delay.delay(100)
    for (let i = state.startTime + 1; i < state.startTime + delay.duration; i++) {
        const delayed = Delay.update(delay, state, i)[1]

        t.assert(delayed.pressure > state.start.pressure)
        t.assert(delayed.pressure < state.end.pressure)

        t.assert(delayed.x > state.start.x)
        t.assert(delayed.x < state.end.x)

        t.assert(delayed.y > state.start.y)
        t.assert(delayed.y < state.end.y)
    }
})

test("(update) should also work for floating-point time", t => {
    const delayed = Delay.update(Delay.delay(1), state, 0.5)[1]

    t.assert(delayed.pressure > state.start.pressure)
    t.assert(delayed.pressure < state.end.pressure)

    t.assert(delayed.x > state.start.x)
    t.assert(delayed.x < state.end.x)

    t.assert(delayed.y > state.start.y)
    t.assert(delayed.y < state.end.y)
})

test("(updateWithInput) works as expected", t => {
    // no delay
    const input = mkInput(600, 600, 1)
    t.deepEqual(Delay.updateWithInput(Delay.delay(0), state, 0, input)[1], input)
    t.deepEqual(Delay.updateWithInput(Delay.delay(0), state, 1, input)[1], input)
    t.deepEqual(Delay.updateWithInput(Delay.delay(1), state, 0, input)[1], state.start)
    t.deepEqual(Delay.updateWithInput(Delay.delay(1), state, 1, input)[1], input)
})

test("(updateWithInput) should also work for floating-point time", t => {
    const input = mkInput(600, 600, 1)
    const delayed = Delay.updateWithInput(Delay.delay(1), state, 0.5, input)[1]

    t.assert(delayed.pressure > state.start.pressure)
    t.assert(delayed.pressure < input.pressure)

    t.assert(delayed.x > state.start.x)
    t.assert(delayed.x < input.x)

    t.assert(delayed.y > state.start.y)
    t.assert(delayed.y < input.y)
})
