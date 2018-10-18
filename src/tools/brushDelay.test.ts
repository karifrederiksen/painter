import * as Delay from "./brushDelay"

function mkInput(x: number, y: number, pressure: number): Delay.Input {
    return { x, y, pressure }
}

describe("brushDelay", () => {
    const state: Delay.State = {
        start: mkInput(0, 0, 0),
        end: mkInput(100, 100, 1),
        startTime: 0,
    }

    test("(update) should produce state.end when delay is 0", () => {
        for (let time = 0; time < 10; time++) {
            expect(Delay.update(Delay.delay(0), state, time)[1]).toEqual(state.end)
        }
    })

    test("(update) should produce state.start when time is equal to startTime", () => {
        expect(Delay.update(Delay.delay(1), state, state.startTime)[1]).toEqual(state.start)
    })

    test("(update) should produce state.end when time is greater than or equal to (startTime + delay)", () => {
        for (let delay = 0; delay < 10; delay++) {
            for (let time = 0; time < 10; time++) {
                const startTime = state.startTime + time + delay
                expect(Delay.update(Delay.delay(delay), state, startTime)[1]).toEqual(state.end)
            }
        }
    })

    test("(update) update should produce values between start and end when time is between (startTime) and (startTime + delay)", () => {
        // we can't test for the absolute values since the easing function's implementation should remain flexible.

        const delay = Delay.delay(100)
        for (let i = state.startTime + 1; i < state.startTime + delay.duration; i++) {
            const delayed = Delay.update(delay, state, i)[1]

            expect(delayed.pressure).toBeGreaterThan(state.start.pressure)
            expect(delayed.pressure).toBeLessThan(state.end.pressure)

            expect(delayed.x).toBeGreaterThan(state.start.x)
            expect(delayed.x).toBeLessThan(state.end.x)

            expect(delayed.y).toBeGreaterThan(state.start.y)
            expect(delayed.y).toBeLessThan(state.end.y)
        }
    })

    test("(update) should also work for floating-point time", () => {
        const delayed = Delay.update(Delay.delay(1), state, 0.5)[1]

        expect(delayed.pressure).toBeGreaterThan(state.start.pressure)
        expect(delayed.pressure).toBeLessThan(state.end.pressure)

        expect(delayed.x).toBeGreaterThan(state.start.x)
        expect(delayed.x).toBeLessThan(state.end.x)

        expect(delayed.y).toBeGreaterThan(state.start.y)
        expect(delayed.y).toBeLessThan(state.end.y)
    })

    test("(updateWithInput) works as expected", () => {
        // no delay
        const input = mkInput(600, 600, 1)
        expect(Delay.updateWithInput(Delay.delay(0), state, 0, input)[1]).toEqual(input)
        expect(Delay.updateWithInput(Delay.delay(0), state, 1, input)[1]).toEqual(input)
        expect(Delay.updateWithInput(Delay.delay(1), state, 0, input)[1]).toEqual(state.start)
        expect(Delay.updateWithInput(Delay.delay(1), state, 1, input)[1]).toEqual(input)
    })

    test("(updateWithInput) should also work for floating-point time", () => {
        const input = mkInput(600, 600, 1)
        const delayed = Delay.updateWithInput(Delay.delay(1), state, 0.5, input)[1]

        expect(delayed.pressure).toBeGreaterThan(state.start.pressure)
        expect(delayed.pressure).toBeLessThan(input.pressure)

        expect(delayed.x).toBeGreaterThan(state.start.x)
        expect(delayed.x).toBeLessThan(input.x)

        expect(delayed.y).toBeGreaterThan(state.start.y)
        expect(delayed.y).toBeLessThan(input.y)
    })
})
