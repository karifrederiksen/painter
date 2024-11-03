export type Result<a, error> = Ok<a, error> | Err<a, error>;
declare abstract class ResultBase<a, error> {
    readonly value: a | null;
    readonly error: error | null;
    abstract isOk(): this is Ok<a, error>;
    abstract isErr(): this is Err<a, error>;
    abstract map<b>(f: (val: a) => b): Result<b, error>;
    abstract mapError<errorB>(f: (val: error) => errorB): Result<a, errorB>;
    abstract andThen<b>(f: (val: a) => Result<b, error>): Result<b, error>;
}
export declare class Ok<a, error> extends ResultBase<a, error> {
    readonly value: a;
    readonly error: null;
    constructor(value: a);
    isOk(): this is Ok<a, error>;
    isErr(): this is Err<a, error>;
    map<b>(f: (val: a) => b): Ok<b, error>;
    mapError<errorB>(): Ok<a, errorB>;
    andThen<b>(f: (val: a) => Result<b, error>): Result<b, error>;
}
export declare class Err<a, error> extends ResultBase<a, error> {
    readonly value: null;
    readonly error: error;
    constructor(error: error);
    isOk(): this is Ok<a, error>;
    isErr(): this is Err<a, error>;
    map<b>(): Err<b, error>;
    mapError<errorB>(f: (val: error) => errorB): Err<a, errorB>;
    andThen<b>(): Err<b, error>;
}
export {};
