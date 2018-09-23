// Very basic and efficient immutable stack

export interface Stack<a> {
    isEmpty(): this is Empty<a>
    isNonEmpty(): this is NonEmpty<a>
    cons(value: a): NonEmpty<a>
    foldl<b>(f: (val: b, next: a) => b, initial: b): b
}

export class Empty<a> implements Stack<a> {
    isEmpty(): true {
        return true
    }

    isNonEmpty(): false {
        return false
    }

    cons(value: a): NonEmpty<a> {
        return new NonEmpty(value, this)
    }

    foldl<b>(_: (val: b, next: a) => b, initial: b): b {
        return initial
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
        return new NonEmpty(value, new Empty())
    }

    constructor(readonly head: a, readonly tail: Stack<a>) {}

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
