import * as Stack from "./stack";

export class ZipperList<a> {
  static singleton<a>(value: a): ZipperList<a> {
    return new ZipperList(Stack.empty(), value, Stack.empty());
  }

  static fromArray<a>(arr: readonly a[]): ZipperList<a> | null {
    if (arr.length === 0) {
      return null;
    }

    return ZipperList.unsafeFromArray(arr);
  }

  static unsafeFromArray<a>(arr: readonly a[]): ZipperList<a> {
    let right: Stack.Stack<a> = Stack.empty();
    for (let i = arr.length - 1; i > 0; i--) {
      right = right.cons(arr[i]);
    }

    return new ZipperList(Stack.empty(), arr[0], right);
  }

  private constructor(
    private readonly __left: Stack.Stack<a>,
    readonly focus: a,
    private readonly __right: Stack.Stack<a>,
  ) {}

  getLeft(): a[] {
    return this.__left.reverse().toArray();
  }

  getRight(): a[] {
    return this.__right.toArray();
  }

  hasLeft(): boolean {
    return this.__left.isNonEmpty();
  }

  hasRight(): boolean {
    return this.__right.isNonEmpty();
  }

  focusLeft(): ZipperList<a> {
    if (this.__left.isNonEmpty()) {
      return new ZipperList(this.__left.tail, this.__left.head, this.__right.cons(this.focus));
    } else {
      return this;
    }
  }

  focusRight(): ZipperList<a> {
    if (this.__right.isNonEmpty()) {
      return new ZipperList(this.__left.cons(this.focus), this.__right.head, this.__right.tail);
    } else {
      return this;
    }
  }

  focusf(f: (val: a) => boolean): ZipperList<a> {
    if (f(this.focus)) return this;

    let attempt: ZipperList<a> = this;

    // try left
    while (attempt.hasLeft()) {
      attempt = attempt.focusLeft();
      if (f(attempt.focus)) return attempt;
    }

    attempt = this;

    // try right
    while (attempt.hasRight()) {
      attempt = attempt.focusRight();
      if (f(attempt.focus)) return attempt;
    }

    return this;
  }

  toArray(): a[] {
    const arr: a[] = [];
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
