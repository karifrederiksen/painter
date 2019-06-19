import * as Rng from "./rng"

describe("rng.xorshift", () => {
    const seeds: readonly Rng.Seed[] = [
        Rng.XorshiftSeed.create(0),
        Rng.XorshiftSeed.create(1),
        Rng.XorshiftSeed.create(2),
        Rng.XorshiftSeed.create(3),
        Rng.XorshiftSeed.create(4),
        Rng.XorshiftSeed.create(5),
        Rng.XorshiftSeed.create(-1 >>> 0),
        Rng.XorshiftSeed.create(-1),
    ]

    test("(nextInt) returns an integer in range 0 to ((2 ** 32) - 1)", () => {
        seeds.forEach(seed => {
            const [val] = seed.nextInt()
            expect(val).toBeGreaterThanOrEqual(0)
            expect(val).toBeLessThanOrEqual(2 ** 32 - 1)
        })
    })

    test("(next) returns a float in range 0 to 1", () => {
        seeds.forEach(seed => {
            const [val] = seed.nextFloat()
            expect(val).toBeGreaterThanOrEqual(0)
            expect(val).toBeLessThanOrEqual(1)
        })
    })

    test("(next2) returns two floats in range 0 to 1", () => {
        seeds.forEach(seed => {
            const [val1, val2] = seed.next2Floats()
            expect(val1).toBeGreaterThanOrEqual(0)
            expect(val1).toBeLessThanOrEqual(1)
            expect(val2).toBeGreaterThanOrEqual(0)
            expect(val2).toBeLessThanOrEqual(1)
        })
    })

    test("(next3) returns three floats in range 0 to 1", () => {
        seeds.forEach(seed => {
            const [val1, val2, val3] = seed.next3Floats()
            expect(val1).toBeGreaterThanOrEqual(0)
            expect(val1).toBeLessThanOrEqual(1)
            expect(val2).toBeGreaterThanOrEqual(0)
            expect(val2).toBeLessThanOrEqual(1)
            expect(val3).toBeGreaterThanOrEqual(0)
            expect(val3).toBeLessThanOrEqual(1)
        })
    })
})
