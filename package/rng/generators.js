export function always(val) {
    return (rng) => [val, rng];
}
export function bool(rng) {
    const [pct, nextSeed] = rng.nextFloat();
    return [pct < 0.5, nextSeed];
}
export function int(min, max) {
    min = min | 0;
    max = max | 0;
    return (rng) => int_(min, max, rng);
}
function int_(min, max, rng) {
    const [pct, nextSeed] = rng.nextFloat();
    const delta = max - min;
    return [pct * delta + min, nextSeed];
}
export function float(min, max) {
    return (rng) => float_(min, max, rng);
}
function float_(min, max, rng) {
    const [pct, nextSeed] = rng.nextFloat();
    const delta = max - min;
    return [pct * delta + min, nextSeed];
}
export function t2(genA, genB) {
    return (rng) => t2_(genA, genB, rng);
}
function t2_(genA, genB, rng0) {
    const [valA, rng1] = genA(rng0);
    const [valB, rng2] = genB(rng1);
    return [[valA, valB], rng2];
}
export function t3(genA, genB, genC) {
    return (rng) => t3_(genA, genB, genC, rng);
}
function t3_(genA, genB, genC, rng0) {
    const [valA, rng1] = genA(rng0);
    const [valB, rng2] = genB(rng1);
    const [valC, rng3] = genC(rng2);
    return [[valA, valB, valC], rng3];
}
export function array(length, gen) {
    return (rng) => array_(length, gen, rng);
}
function array_(length, gen, rng) {
    const arr = new Array(length);
    for (let i = 0; i < length; i++) {
        const [val, nextRng] = gen(rng);
        arr[i] = val;
        rng = nextRng;
    }
    return [arr, rng];
}
export function object(gens) {
    return (rng) => object_(gens, rng);
}
function object_(gens, rng) {
    /* eslint-disable */
    const obj = {};
    for (const prop in gens) {
        const [val, nextRng] = gens[prop](rng);
        obj[prop] = val;
        rng = nextRng;
    }
    /* eslint-enable */
    return [obj, rng];
}
export function map(genA, f) {
    return (rng) => map_(genA, f, rng);
}
function map_(genA, f, rng0) {
    const [valA, rng1] = genA(rng0);
    return [f(valA), rng1];
}
export function map2(genA, genB, f) {
    return (rng) => map2_(genA, genB, f, rng);
}
function map2_(genA, genB, f, rng0) {
    const [valA, rng1] = genA(rng0);
    const [valB, rng2] = genB(rng1);
    return [f(valA, valB), rng2];
}
export function map3(genA, genB, genC, f) {
    return (rng) => map3_(genA, genB, genC, f, rng);
}
function map3_(genA, genB, genC, f, rng0) {
    const [valA, rng1] = genA(rng0);
    const [valB, rng2] = genB(rng1);
    const [valC, rng3] = genC(rng2);
    return [f(valA, valB, valC), rng3];
}
export function map4(genA, genB, genC, genD, f) {
    return (rng) => map4_(genA, genB, genC, genD, f, rng);
}
function map4_(genA, genB, genC, genD, f, rng0) {
    const [valA, rng1] = genA(rng0);
    const [valB, rng2] = genB(rng1);
    const [valC, rng3] = genC(rng2);
    const [valD, rng4] = genD(rng3);
    return [f(valA, valB, valC, valD), rng4];
}
export function andThen(genA, f) {
    return (rng) => andThen_(genA, f, rng);
}
function andThen_(genA, f, rng0) {
    const [valA, rng1] = genA(rng0);
    return f(valA)(rng1);
}
export function lazy(createGen) {
    let cachedGen = null;
    return (rng) => {
        if (cachedGen === null) {
            cachedGen = createGen();
        }
        return cachedGen(rng);
    };
}
