export interface Stack<a> {
	isEmpty(): this is Empty<a>;
	isNonEmpty(): this is NonEmpty<a>;
	cons(value: a): NonEmpty<a>;
	foldl<b>(f: (val: b, next: a) => b, initial: b): b;
	reverse(): Stack<a>;
	toArray(): a[];
	toString(): string;
}

export class Empty<a> implements Stack<a> {
	isEmpty(): this is Empty<a> {
		return true;
	}

	isNonEmpty(): this is NonEmpty<a> {
		return false;
	}

	cons(value: a): NonEmpty<a> {
		return new NonEmpty(value, this);
	}

	foldl<b>(_: (val: b, next: a) => b, initial: b): b {
		return initial;
	}

	reverse(): Empty<a> {
		return this;
	}

	toArray(): a[] {
		return [];
	}

	toString(): string {
		return "()";
	}
}

export class NonEmpty<a> implements Stack<a> {
	static of<a>(value: a): NonEmpty<a> {
		return new NonEmpty(value, empty());
	}

	readonly head: a;
	readonly tail: Stack<a>;

	constructor(head: a, tail: Stack<a>) {
		this.head = head;
		this.tail = tail;
	}

	isEmpty(): this is Empty<a> {
		return false;
	}

	isNonEmpty(): this is NonEmpty<a> {
		return true;
	}

	cons(value: a): NonEmpty<a> {
		return new NonEmpty(value, this);
	}

	foldl<b>(f: (val: b, next: a) => b, initial: b): b {
		let stack: Stack<a> = this;
		let state = initial;
		while (stack.isNonEmpty()) {
			state = f(state, stack.head);
			stack = stack.tail;
		}
		return state;
	}

	reverse(): NonEmpty<a> {
		let nonReversed = this.tail;
		let reversed = NonEmpty.of(this.head);
		while (nonReversed.isNonEmpty()) {
			reversed = reversed.cons(nonReversed.head);
			nonReversed = nonReversed.tail;
		}
		return reversed;
	}

	toArray(): a[] {
		const arr: a[] = [this.head];
		let stack = this.tail;
		while (stack.isNonEmpty()) {
			arr.push(stack.head);
			stack = stack.tail;
		}
		return arr;
	}

	toString(): string {
		let str = "(" + this.head;
		let stack: Stack<a> = this.tail;
		while (stack.isNonEmpty()) {
			str = str + ", " + stack.head;
			stack = stack.tail;
		}

		return str + ")";
	}
}

export function empty<a>(): Empty<a> {
	return new Empty();
}

export function fromArray<a>(arr: readonly a[]): Stack<a> {
	let stack: Stack<a> = empty();
	let i = arr.length;
	while (i--) {
		stack = stack.cons(arr[i]);
	}
	return stack;
}
