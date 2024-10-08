export * as Stack from "./stack.js";
export interface PushArray<T> extends ReadonlyArray<T> {
    push(...items: T[]): void;
}
export interface StackArray<T> extends ReadonlyArray<T> {
    push(value: T): void;
    pop(): T | undefined;
}
