import { Stack } from "./stack"

describe("Stack", () => {
    const testStacks: readonly Stack.Stack<any>[] = [
        Stack.empty(),
        Stack.empty().cons(1),
        Stack.fromArray([1, 2, 3, 4]),
        Stack.fromArray(["a", "b", "c", "d"]),
        Stack.fromArray([{}, {}, {}]),
        Stack.fromArray(new Array(1000).fill(0).map((_, i) => i)),
    ]

    test("(empty) returns an empty stack", () => {
        expect(Stack.empty().isEmpty()).toBe(true)
        expect(Stack.empty().isNonEmpty()).toBe(false)
    })

    test("(fromArray) builds the stack in the correct order", () => {
        // head of the stack is on the left, so it is equivalent to array[0]
        // tail is equivalent to array.slice(1)
        const single = Stack.fromArray(["g"]) as Stack.NonEmpty<string>
        const double = Stack.fromArray(["h", "g"]) as Stack.NonEmpty<string>
        expect(Stack.fromArray([])).toEqual(Stack.empty())
        expect(single.head).toEqual("g")
        expect(single.tail).toEqual(Stack.empty())
        expect(double.head).toEqual("h")
        expect(double.head).toEqual("h")
        expect(double.tail).toEqual(single)
    })

    test("(cons) adds an element to the front", () => {
        for (const stk of testStacks) {
            const n = Math.random()
            const stk2 = stk.cons(n)
            expect(stk2.isEmpty()).toBe(false)
            expect(stk2.isNonEmpty()).toBe(true)
            expect(stk2.head).toBe(n)
            expect(stk2.tail).toEqual(stk)
        }
    })

    test("(toArray) converts the stack to its equivalent array form", () => {
        for (const stk of testStacks) {
            expect(Stack.fromArray(stk.toArray())).toEqual(stk)
        }
    })

    test("(reverse >> reverse) is identity", () => {
        for (const stk of testStacks) {
            expect(stk).toEqual(stk.reverse().reverse())
        }
    })

    test("(reverse >> toArray) and (toArray >> reverse) are equivalent", () => {
        for (const stk of testStacks) {
            const x = stk.toArray().reverse()
            const y = stk.reverse().toArray()

            expect(x.length).toBe(y.length)
            for (let i = 0; i < x.length; i++) {
                expect(x[i]).toBe(y[i])
            }
        }
    })

    test("(foldl) and (toArray >> reduce) are equivalent for functions with 2 argument", () => {
        const fns: readonly ((x: number, y: number) => any)[] = [
            (x: number, y: number) => x + y,
            (x: number, y: number) => x * y,
            (x: number, y: number) => x + ", " + y,
            (x: number, y: number) => x % y,
        ]

        for (const stk of testStacks) {
            for (const f of fns) {
                const initial = Math.floor(Math.random() * 1000)
                const x = stk.foldl(f, initial)
                const y = stk.toArray().reduce(f, initial)
                expect(x).toBe(y)
            }
        }
    })
})
