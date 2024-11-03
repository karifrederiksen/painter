// Very basic and efficient immutable stack
export class Empty {
    isEmpty() {
        return true;
    }
    isNonEmpty() {
        return false;
    }
    cons(value) {
        return new NonEmpty(value, this);
    }
    foldl(_, initial) {
        return initial;
    }
    reverse() {
        return this;
    }
    toArray() {
        return [];
    }
    toString() {
        return "()";
    }
}
export class NonEmpty {
    head;
    tail;
    static of(value) {
        return new NonEmpty(value, empty());
    }
    constructor(head, tail) {
        this.head = head;
        this.tail = tail;
    }
    isEmpty() {
        return false;
    }
    isNonEmpty() {
        return true;
    }
    cons(value) {
        return new NonEmpty(value, this);
    }
    foldl(f, initial) {
        let stack = this;
        let state = initial;
        while (stack.isNonEmpty()) {
            state = f(state, stack.head);
            stack = stack.tail;
        }
        return state;
    }
    reverse() {
        let nonReversed = this.tail;
        let reversed = NonEmpty.of(this.head);
        while (nonReversed.isNonEmpty()) {
            reversed = reversed.cons(nonReversed.head);
            nonReversed = nonReversed.tail;
        }
        return reversed;
    }
    toArray() {
        const arr = [this.head];
        let stack = this.tail;
        while (stack.isNonEmpty()) {
            arr.push(stack.head);
            stack = stack.tail;
        }
        return arr;
    }
    toString() {
        let str = "(" + this.head;
        let stack = this.tail;
        while (stack.isNonEmpty()) {
            str = str + ", " + stack.head;
            stack = stack.tail;
        }
        return str + ")";
    }
}
export function empty() {
    return new Empty();
}
export function fromArray(arr) {
    let stack = empty();
    let i = arr.length;
    while (i--) {
        stack = stack.cons(arr[i]);
    }
    return stack;
}
