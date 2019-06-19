import * as Rng from "./rng"
import { T2, T3 } from "../util"

type GenResult<a> = T2<a, Rng.Seed>

export interface Generators<a> {
    (rng: Rng.Seed): T2<a, Rng.Seed>
}

export namespace Generators {
    export function always<a>(val: a): Generators<a> {
        return rng => [val, rng]
    }

    export function bool(rng: Rng.Seed): GenResult<boolean> {
        const [pct, nextSeed] = rng.nextFloat()
        return [pct < 0.5, nextSeed]
    }

    export function int(min: number, max: number): Generators<number> {
        min = min | 0
        max = max | 0
        return rng => int_(min, max, rng)
    }

    function int_(min: number, max: number, rng: Rng.Seed): GenResult<number> {
        const [pct, nextSeed] = rng.nextFloat()
        const delta = max - min
        return [pct * delta + min, nextSeed]
    }

    export function float(min: number, max: number): Generators<number> {
        return rng => float_(min, max, rng)
    }

    function float_(min: number, max: number, rng: Rng.Seed): GenResult<number> {
        const [pct, nextSeed] = rng.nextFloat()
        const delta = max - min
        return [pct * delta + min, nextSeed]
    }

    export function t2<a, b>(genA: Generators<a>, genB: Generators<b>): Generators<T2<a, b>> {
        return rng => t2_(genA, genB, rng)
    }

    function t2_<a, b>(
        genA: Generators<a>,
        genB: Generators<b>,
        rng0: Rng.Seed
    ): GenResult<T2<a, b>> {
        const [valA, rng1] = genA(rng0)
        const [valB, rng2] = genB(rng1)
        return [[valA, valB], rng2]
    }

    export function t3<a, b, c>(
        genA: Generators<a>,
        genB: Generators<b>,
        genC: Generators<c>
    ): Generators<T3<a, b, c>> {
        return rng => t3_(genA, genB, genC, rng)
    }

    function t3_<a, b, c>(
        genA: Generators<a>,
        genB: Generators<b>,
        genC: Generators<c>,
        rng0: Rng.Seed
    ): GenResult<T3<a, b, c>> {
        const [valA, rng1] = genA(rng0)
        const [valB, rng2] = genB(rng1)
        const [valC, rng3] = genC(rng2)
        return [[valA, valB, valC], rng3]
    }

    export function array<a>(length: number, gen: Generators<a>): Generators<a[]> {
        return rng => array_(length, gen, rng)
    }

    function array_<a>(length: number, gen: Generators<a>, rng: Rng.Seed): GenResult<a[]> {
        const arr = new Array(length)
        for (let i = 0; i < length; i++) {
            const [val, nextRng] = gen(rng)
            arr[i] = val
            rng = nextRng
        }
        return [arr, rng]
    }

    export type ObjectProps<a> = { readonly [propName in keyof a]: Generators<a[propName]> }

    export function object<a>(gens: ObjectProps<a>): Generators<a> {
        return rng => object_(gens, rng)
    }

    function object_<a>(gens: ObjectProps<a>, rng: Rng.Seed): GenResult<a> {
        /* eslint-disable */
        const obj = {} as a
        for (const prop in gens) {
            const [val, nextRng] = gens[prop](rng)
            obj[prop] = val
            rng = nextRng
        }
        /* eslint-enable */
        return [obj, rng]
    }

    export function map<a, b>(genA: Generators<a>, f: (valA: a) => b): Generators<b> {
        return rng => map_(genA, f, rng)
    }

    function map_<a, b>(genA: Generators<a>, f: (valA: a) => b, rng0: Rng.Seed): GenResult<b> {
        const [valA, rng1] = genA(rng0)
        return [f(valA), rng1]
    }

    export function map2<a, b, c>(
        genA: Generators<a>,
        genB: Generators<b>,
        f: (valA: a, valB: b) => c
    ): Generators<c> {
        return rng => map2_(genA, genB, f, rng)
    }

    function map2_<a, b, c>(
        genA: Generators<a>,
        genB: Generators<b>,
        f: (valA: a, valB: b) => c,
        rng0: Rng.Seed
    ): GenResult<c> {
        const [valA, rng1] = genA(rng0)
        const [valB, rng2] = genB(rng1)
        return [f(valA, valB), rng2]
    }

    export function map3<a, b, c, d>(
        genA: Generators<a>,
        genB: Generators<b>,
        genC: Generators<c>,
        f: (valA: a, valB: b, valC: c) => d
    ): Generators<d> {
        return rng => map3_(genA, genB, genC, f, rng)
    }

    function map3_<a, b, c, d>(
        genA: Generators<a>,
        genB: Generators<b>,
        genC: Generators<c>,
        f: (valA: a, valB: b, valC: c) => d,
        rng0: Rng.Seed
    ): GenResult<d> {
        const [valA, rng1] = genA(rng0)
        const [valB, rng2] = genB(rng1)
        const [valC, rng3] = genC(rng2)
        return [f(valA, valB, valC), rng3]
    }

    export function map4<a, b, c, d, e>(
        genA: Generators<a>,
        genB: Generators<b>,
        genC: Generators<c>,
        genD: Generators<d>,
        f: (valA: a, valB: b, valC: c, valD: d) => e
    ): Generators<e> {
        return rng => map4_(genA, genB, genC, genD, f, rng)
    }

    function map4_<a, b, c, d, e>(
        genA: Generators<a>,
        genB: Generators<b>,
        genC: Generators<c>,
        genD: Generators<d>,
        f: (valA: a, valB: b, valC: c, valD: d) => e,
        rng0: Rng.Seed
    ): GenResult<e> {
        const [valA, rng1] = genA(rng0)
        const [valB, rng2] = genB(rng1)
        const [valC, rng3] = genC(rng2)
        const [valD, rng4] = genD(rng3)
        return [f(valA, valB, valC, valD), rng4]
    }

    export function andThen<a, b>(
        genA: Generators<a>,
        f: (val: a) => Generators<b>
    ): Generators<b> {
        return rng => andThen_(genA, f, rng)
    }

    function andThen_<a, b>(
        genA: Generators<a>,
        f: (val: a) => Generators<b>,
        rng0: Rng.Seed
    ): GenResult<b> {
        const [valA, rng1] = genA(rng0)
        return f(valA)(rng1)
    }

    export function lazy<a>(createGen: () => Generators<a>): Generators<a> {
        let cachedGen: Generators<a> | null = null
        return rng => {
            if (cachedGen === null) {
                cachedGen = createGen()
            }
            return cachedGen(rng)
        }
    }
}
