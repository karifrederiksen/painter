
// Very basic and efficient immutable stack

export interface Stack<a> {
    isNonEmpty(): this is NonEmptyStack<a>
    cons(value: a): NonEmptyStack<a>
}

export class EmptyStack<a> implements Stack<a> {
    isNonEmpty(): false {
        return false
    }

    cons(value: a): NonEmptyStack<a> {
        return new NonEmptyStack(value, this)
    }
}

export class NonEmptyStack<a> implements Stack<a> {
    constructor(readonly head: a, readonly tail: Stack<a>) {}

    isNonEmpty(): true {
        return true
    }

    cons(value: a): NonEmptyStack<a> {
        return new NonEmptyStack(value, this)
    }
}