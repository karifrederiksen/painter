import * as Stack from "./stack.js";
export class ZipperList {
    __left;
    focus;
    __right;
    static singleton(value) {
        return new ZipperList(Stack.empty(), value, Stack.empty());
    }
    static fromArray(arr) {
        if (arr.length === 0) {
            return null;
        }
        return ZipperList.unsafeFromArray(arr);
    }
    static unsafeFromArray(arr) {
        let right = Stack.empty();
        for (let i = arr.length - 1; i > 0; i--) {
            right = right.cons(arr[i]);
        }
        return new ZipperList(Stack.empty(), arr[0], right);
    }
    constructor(__left, focus, __right) {
        this.__left = __left;
        this.focus = focus;
        this.__right = __right;
    }
    getLeft() {
        return this.__left.reverse().toArray();
    }
    getRight() {
        return this.__right.toArray();
    }
    hasLeft() {
        return this.__left.isNonEmpty();
    }
    hasRight() {
        return this.__right.isNonEmpty();
    }
    focusLeft() {
        if (this.__left.isNonEmpty()) {
            return new ZipperList(this.__left.tail, this.__left.head, this.__right.cons(this.focus));
        }
        else {
            return this;
        }
    }
    focusRight() {
        if (this.__right.isNonEmpty()) {
            return new ZipperList(this.__left.cons(this.focus), this.__right.head, this.__right.tail);
        }
        else {
            return this;
        }
    }
    focusf(f) {
        if (f(this.focus))
            return this;
        let attempt = this;
        // try left
        while (attempt.hasLeft()) {
            attempt = attempt.focusLeft();
            if (f(attempt.focus))
                return attempt;
        }
        attempt = this;
        // try right
        while (attempt.hasRight()) {
            attempt = attempt.focusRight();
            if (f(attempt.focus))
                return attempt;
        }
        return this;
    }
    toArray() {
        const arr = [];
        let stack = this.__left.reverse();
        while (stack.isNonEmpty()) {
            arr.push(stack.head);
            stack = stack.tail;
        }
        arr.push(this.focus);
        stack = this.__right;
        while (stack.isNonEmpty()) {
            arr.push(stack.head);
            stack = stack.tail;
        }
        return arr;
    }
}
