import { T2 } from "./tuples"

export type Result<ok, err> = T2<false, err> | T2<true, ok>

export namespace Result {
    export function isOk<ok, err>(res: Result<ok, err>): res is T2<true, ok> {
        return res[0]
    }
    export function isErr<ok, err>(res: Result<ok, err>): res is T2<false, err> {
        return !res[0]
    }

    export function ok<ok, err>(val: ok): Result<ok, err> {
        return [true, val]
    }

    export function err<ok, err>(val: err): Result<ok, err> {
        return [false, val]
    }

    export function map<ok, err, newOk>(
        res: Result<ok, err>,
        f: (val: ok) => newOk
    ): Result<newOk, err> {
        if (isOk(res)) {
            return [true, f(res[1])]
        } else {
            return [false, res[1]]
        }
    }

    export function mapErr<ok, err, newErr>(
        res: Result<ok, err>,
        f: (val: err) => newErr
    ): Result<ok, newErr> {
        if (isOk(res)) {
            return [true, res[1]]
        } else {
            return [false, f(res[1])]
        }
    }

    export function andThen<ok, err, newOk>(
        res: Result<ok, err>,
        f: (val: ok) => Result<newOk, err>
    ): Result<newOk, err> {
        if (isOk(res)) {
            return f(res[1])
        } else {
            return [false, res[1]]
        }
    }
}
