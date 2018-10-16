import * as Rng from "./rng"

describe("rng", () => {
    const seeds: ReadonlyArray<Rng.Seed> = [
        Rng.seed(0),
        Rng.seed(1),
        Rng.seed(2),
        Rng.seed(3),
        Rng.seed(4),
        Rng.seed(5),
        Rng.seed(-1 >>> 0),
        Rng.seed(-1),
    ]

    test("(nextInt) returns an integer in range 0 to ((2 ** 32) - 1)", () => {
        seeds.forEach(seed => {
            const [val] = Rng.nextInt(seed)
            expect(val).toBeGreaterThanOrEqual(0)
            expect(val).toBeLessThanOrEqual(2 ** 32 - 1)
        })
    })

    test("(next) returns a float in range 0 to 1", () => {
        seeds.forEach(seed => {
            const [val] = Rng.next(seed)
            expect(val).toBeGreaterThanOrEqual(0)
            expect(val).toBeLessThanOrEqual(1)
        })
    })

    test("(next2) returns two floats in range 0 to 1", () => {
        seeds.forEach(seed => {
            const [val1, val2] = Rng.next2(seed)
            expect(val1).toBeGreaterThanOrEqual(0)
            expect(val1).toBeLessThanOrEqual(1)
            expect(val2).toBeGreaterThanOrEqual(0)
            expect(val2).toBeLessThanOrEqual(1)
        })
    })

    test("(next3) returns three floats in range 0 to 1", () => {
        seeds.forEach(seed => {
            const [val1, val2, val3] = Rng.next3(seed)
            expect(val1).toBeGreaterThanOrEqual(0)
            expect(val1).toBeLessThanOrEqual(1)
            expect(val2).toBeGreaterThanOrEqual(0)
            expect(val2).toBeLessThanOrEqual(1)
            expect(val3).toBeGreaterThanOrEqual(0)
            expect(val3).toBeLessThanOrEqual(1)
        })
    })
})
