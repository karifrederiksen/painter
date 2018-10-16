import { Stack } from "./stack"

describe("Stack", () => {
    const testStacks: ReadonlyArray<Stack.Stack<any>> = [
        Stack.empty(),
        Stack.empty().cons(1),
        Stack.fromArray([1, 2, 3, 4]),
        Stack.fromArray(["a", "b", "c", "d"]),
        Stack.fromArray([{}, {}, {}]),
        Stack.fromArray(new Array(1000).fill(0).map((_, i) => i)),
    ]

    test("(cons) adds an element to the front", () => {
        testStacks.forEach(stk => {
            const n = Math.random()
            const arr = stk.cons(n).toArray()
            const arr2 = stk.toArray()
            arr2.unshift(n)
            expect(arr).toEqual(arr2)
        })
    })

    test("(toArray) converts the stack to its equivalent array form", () => {
        testStacks.forEach(stk => {
            expect(stk.toArray().every(x => x != null)).toBe(true)
        })

        testStacks.forEach(stk => {
            expect(Stack.fromArray(stk.toArray())).toEqual(stk)
        })
    })

    test("(reverse >> reverse) is identity", () => {
        testStacks.forEach(stk => {
            const doubleReversed = stk.reverse().reverse()
            expect(stk).toEqual(doubleReversed)
        })
    })

    test("(reverse >> toArray) and (toArray >> reverse) are equivalent", () => {
        testStacks.forEach(stk => {
            const x = stk.toArray().reverse()
            const y = stk.reverse().toArray()

            expect(x.length).toBe(y.length)
            for (let i = 0; i < x.length; i++) {
                expect(x[i]).toBe(y[i])
            }
        })
    })

    test("(foldl) and (toArray >> reduce) are equivalent for functions with 2 argument", () => {
        const fns: ReadonlyArray<(x: number, y: number) => any> = [
            (x: number, y: number) => x + y,
            (x: number, y: number) => x * y,
            (x: number, y: number) => x + ", " + y,
            (x: number, y: number) => x % y,
        ]

        testStacks.forEach(stk => {
            fns.forEach(f => {
                const initial = Math.floor(Math.random() * 1000)
                const x = stk.foldl(f, initial)
                const y = stk.toArray().reduce(f, initial)
                expect(x).toEqual(y)
            })
        })
    })
})
