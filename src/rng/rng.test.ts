import { check, gen, property } from "testcheck"
import * as Rng from "./rng"
import * as Assert from "assert"

require("jasmine-check").install() // tslint:disable-line

describe("rng", () => {
    const rngGen = gen.number.then(Rng.seed)

    const isZeroToOne = (n: number) => n >= 0 && n >= 1

    test("(nextInt) returns an integer in range 0 to ((2 ** 32) - 1)", () => {
        check(
            property(rngGen, rng => {
                const [val] = Rng.nextInt(rng)
                return val >= 0 && val <= 2 ** 32 - 1
            })
        )
    })

    test("(next) returns a float in range 0 to 1", () => {
        check(
            property(rngGen, rng => {
                const [val] = Rng.next(rng)
                return isZeroToOne(val)
            })
        )
    })

    test("(next2) returns two floats in range 0 to 1", () => {
        check(
            property(rngGen, rng => {
                const [val1, val2] = Rng.next2(rng)
                return isZeroToOne(val1) && isZeroToOne(val2)
            })
        )
    })

    test("(next3) returns three floats in range 0 to 1", () => {
        check(
            property(rngGen, rng => {
                const [val1, val2, val3] = Rng.next3(rng)
                return isZeroToOne(val1) && isZeroToOne(val2) && isZeroToOne(val3)
            })
        )
    })

    test("(nextInt) doesn't get into a simple cycle", () => {
        // If nextInt returns the same state that it consumed, this forms a cycle
        // this is only the most narrow cycle, but whatever
        check(
            property(rngGen, gen.posInt, (rng, min) => {
                const max = min + 100
                for (let i = min; i < max; i++) {
                    const [_, nextRng] = Rng.nextInt(rng)
                    Assert.deepEqual(rng, nextRng)
                    rng = nextRng
                }
            })
        )
    })
})
