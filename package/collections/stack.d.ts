export interface Stack<a> {
    isEmpty(): this is Empty<a>;
    isNonEmpty(): this is NonEmpty<a>;
    cons(value: a): NonEmpty<a>;
    foldl<b>(f: (val: b, next: a) => b, initial: b): b;
    reverse(): Stack<a>;
    toArray(): a[];
    toString(): string;
}
export declare class Empty<a> implements Stack<a> {
    isEmpty(): true;
    isNonEmpty(): false;
    cons(value: a): NonEmpty<a>;
    foldl<b>(_: (val: b, next: a) => b, initial: b): b;
    reverse(): Empty<a>;
    toArray(): a[];
    toString(): string;
}
export declare class NonEmpty<a> implements Stack<a> {
    readonly head: a;
    readonly tail: Stack<a>;
    static of<a>(value: a): NonEmpty<a>;
    constructor(head: a, tail: Stack<a>);
    isEmpty(): false;
    isNonEmpty(): true;
    cons(value: a): NonEmpty<a>;
    foldl<b>(f: (val: b, next: a) => b, initial: b): b;
    reverse(): NonEmpty<a>;
    toArray(): a[];
    toString(): string;
}
export declare function empty<a>(): Empty<a>;
export declare function fromArray<a>(arr: readonly a[]): Stack<a>;
