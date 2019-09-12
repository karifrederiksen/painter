import test from "ava"
import * as Rng from "./rng"

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

test("(nextInt) returns an integer in range 0 to ((2 ** 32) - 1)", t => {
    seeds.forEach(seed => {
        const [val] = seed.nextInt()
        t.assert(val >= 0)
        t.assert(val <= 2 ** 32 - 1)
    })
})

test("(next) returns a float in range 0 to 1", t => {
    seeds.forEach(seed => {
        const [val] = seed.nextFloat()
        t.assert(val >= 0)
        t.assert(val <= 1)
    })
})

test("(next2) returns two floats in range 0 to 1", t => {
    seeds.forEach(seed => {
        const [val1, val2] = seed.next2Floats()
        t.assert(val1 >= 0)
        t.assert(val1 <= 1)
        t.assert(val2 >= 0)
        t.assert(val2 <= 1)
    })
})

test("(next3) returns three floats in range 0 to 1", t => {
    seeds.forEach(seed => {
        const [val1, val2, val3] = seed.next3Floats()
        t.assert(val1 >= 0)
        t.assert(val1 <= 1)
        t.assert(val2 >= 0)
        t.assert(val2 <= 1)
        t.assert(val3 >= 0)
        t.assert(val3 <= 1)
    })
})
