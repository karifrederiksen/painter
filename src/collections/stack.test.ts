import { check, gen, property } from "testcheck"
import { Stack } from "./stack"
import * as Assert from "assert"

require("jasmine-check").install() // tslint:disable-line

describe("Stack", () => {
    const stackGen = gen.array(gen.number).then(Stack.fromArray)

    test("(cons) adds an element to the front", () => {
        check(
            property(stackGen, gen.number, (stk, n) => {
                const x = stk.toArray()
                x.unshift(n)
                const y = stk.cons(n).toArray()
                Assert.deepEqual(x, y)
            })
        )
    })

    test("(toArray) converts the stack to its equivalent array form", () => {
        check(
            property(stackGen, stk => {
                Assert.deepEqual(stk, Stack.fromArray(stk.toArray()))
            })
        )
    })

    test("(reverse >> reverse) is identity", () => {
        check(
            property(stackGen, stk => {
                Assert.deepEqual(stk, stk.reverse().reverse())
            })
        )
    })

    test("(reverse >> toArray) and (toArray >> reverse) are equivalent", () => {
        check(
            property(stackGen, stk => {
                const x = stk.toArray().reverse()
                const y = stk.reverse().toArray()
                Assert.deepEqual(x, y)
            })
        )
    })

    test("(foldl) and (toArray >> reduce) are equivalent for functions with 2 argument", () => {
        const fns: ReadonlyArray<(x: number, y: number) => any> = [
            (x, y) => x + y,
            (x, y) => x * y,
            (x, y) => x + ", " + y,
            (x, y) => x % y,
        ]
        check(
            property(
                stackGen,
                gen.number,
                gen.intWithin(0, fns.length - 1).then(i => fns[i]),
                (stk, initial, f) => {
                    const x = stk.foldl(f, initial)
                    const y = stk.toArray().reduce(f, initial)
                    Assert.deepEqual(x, y)
                }
            )
        )
    })
})
