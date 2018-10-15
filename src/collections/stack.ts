// Very basic and efficient immutable stack

export namespace Stack {
    export interface Stack<a> {
        isEmpty(): this is Empty<a>
        isNonEmpty(): this is NonEmpty<a>
        cons(value: a): NonEmpty<a>
        foldl<b>(f: (val: b, next: a) => b, initial: b): b
        reverse(): Stack<a>
        toArray(): Array<a>
    }

    export class Empty<a> implements Stack<a> {
        private static instance = new Empty<any>()

        static make<a>(): Empty<a> {
            return Empty.instance
        }

        private constructor() {}

        isEmpty(): true {
            return true
        }

        isNonEmpty(): false {
            return false
        }

        cons(value: a): NonEmpty<a> {
            return NonEmpty.make(value, this)
        }

        foldl<b>(_: (val: b, next: a) => b, initial: b): b {
            return initial
        }

        reverse(): Empty<a> {
            return this
        }

        toArray(): Array<a> {
            return []
        }

        toString(): string {
            return "Nil"
        }
    }

    export class NonEmpty<a> implements Stack<a> {
        static of<a>(value: a): NonEmpty<a> {
            return new NonEmpty(value, Empty.make())
        }

        static make<a>(head: a, tail: Stack<a>): NonEmpty<a> {
            return new NonEmpty<a>(head, tail)
        }

        private constructor(readonly head: a, readonly tail: Stack<a>) {}

        isEmpty(): false {
            return false
        }

        isNonEmpty(): true {
            return true
        }

        cons(value: a): NonEmpty<a> {
            return new NonEmpty(value, this)
        }

        foldl<b>(f: (val: b, next: a) => b, initial: b): b {
            let stack: Stack<a> = this
            let state = initial
            while (stack.isNonEmpty()) {
                state = f(state, stack.head)
                stack = stack.tail
            }
            return state
        }

        reverse(): NonEmpty<a> {
            let nonReversed = this.tail
            let reversed = NonEmpty.of(this.head)
            while (nonReversed.isNonEmpty()) {
                reversed = reversed.cons(nonReversed.head)
                nonReversed = nonReversed.tail
            }
            return reversed
        }

        toArray(): Array<a> {
            const arr: Array<a> = [this.head]
            let stack = this.tail
            while (stack.isNonEmpty()) {
                arr.push(stack.head)
                stack = stack.tail
            }
            return arr
        }

        toString(): string {
            return "Cons (" + this.head + " " + this.tail + ")"
        }
    }

    export function fromArray<a>(arr: ReadonlyArray<a>): Stack<a> {
        let stack: Stack<a> = Empty.make()
        for (let i = 0; i < arr.length; i++) {
            stack = stack.cons(arr[i])
        }
        return stack
    }
}
