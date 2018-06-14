export abstract class Result<okType, errType> {
    static ok<a, b>(value: a): Result<a, b> {
        return new Ok(value)
    }

    static err<a, b>(value: b): Result<a, b> {
        return new Err(value)
    }

    static fromMaybe<a, b>(maybe: a | null | undefined, ifErr: b): Result<a, b> {
        return maybe != null ? Result.ok(maybe) : Result.err(ifErr)
    }

    abstract isOk(): this is Ok<okType, errType>
    abstract isErr(): this is Err<okType, errType>
    abstract ok(): okType | undefined
    abstract err(): errType | undefined
    abstract unwrap(): okType
    abstract map<c>(fn: (val: okType) => c): Result<c, errType>
    abstract mapErr<c>(fn: (val: errType) => c): Result<okType, c>
    abstract match<c>(
        caseOk: (val: okType) => c,
        caseErr: (val: errType) => c,
    ): c
    abstract toMaybe(): okType | null
}

export class Ok<okType, errType> implements Result<okType, errType> {
    private readonly __ok: okType

    constructor(val: okType) {
        this.__ok = val
    }

    isOk(): this is Ok<okType, errType> {
        return true
    }

    isErr(): this is Err<okType, errType> {
        return false
    }

    ok(): okType {
        return this.__ok
    }

    err(): undefined {
        return void 0
    }

    unwrap(): okType {
        return this.__ok
    }

    map<a>(fn: (val: okType) => a): Ok<a, errType> {
        return new Ok(fn(this.__ok))
    }

    mapErr<a>(_: (val: errType) => a): Ok<okType, a> {
        return (this as any) as Ok<okType, a>
    }

    match<a>(caseOk: (val: okType) => a): a {
        return caseOk(this.__ok)
    }

    toMaybe(): okType {
        return this.__ok
    }

    toJSON() {
        return this.__ok
    }

    toString() {
        return "Ok( " + this.__ok + " )"
    }
}

export class Err<okType, errType> implements Result<okType, errType> {
    private readonly __err: errType

    constructor(val: errType) {
        this.__err = val
    }

    isOk(): this is Ok<okType, errType> {
        return false
    }

    isErr(): this is Err<okType, errType> {
        return true
    }

    ok(): undefined {
        return void 0
    }

    err(): errType {
        return this.__err
    }

    unwrap(): okType {
        throw "Unwrapped an Err with value ( " + this.__err + " )"
    }

    map<a>(_: (val: okType) => a): Err<a, errType> {
        return (this as any) as Err<a, errType>
    }

    mapErr<a>(fn: (val: errType) => a): Err<okType, a> {
        return new Err(fn(this.__err))
    }

    match<a>(_: any, caseErr: (val: errType) => a): a {
        return caseErr(this.__err)
    }

    toMaybe(): null {
        return null
    }

    toJSON() {
        return this.__err
    }

    toString() {
        return "Err( " + this.__err + " )"
    }
}