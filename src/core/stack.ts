// Very basic and efficient immutable stack

export interface Stack<a> {
    isEmpty(): this is EmptyStack<a>
    isNonEmpty(): this is NonEmptyStack<a>
    cons(value: a): NonEmptyStack<a>
}

export class EmptyStack<a> implements Stack<a> {
    isEmpty(): true {
        return true
    }

    isNonEmpty(): false {
        return false
    }

    cons(value: a): NonEmptyStack<a> {
        return new NonEmptyStack(value, this)
    }

    toArray(): Array<a> {
        return []
    }

    toString(): string {
        return "Empty"
    }
}

export class NonEmptyStack<a> implements Stack<a> {
    static of<a>(value: a): NonEmptyStack<a> {
        return new NonEmptyStack(value, new EmptyStack())
    }

    constructor(readonly head: a, readonly tail: Stack<a>) {}

    isEmpty(): false {
        return false
    }

    isNonEmpty(): true {
        return true
    }

    cons(value: a): NonEmptyStack<a> {
        return new NonEmptyStack(value, this)
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
