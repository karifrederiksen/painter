import { test } from "vitest";
import * as Rng from "./rng";
const seeds = [
    Rng.XorshiftSeed.create(0),
    Rng.XorshiftSeed.create(1),
    Rng.XorshiftSeed.create(2),
    Rng.XorshiftSeed.create(3),
    Rng.XorshiftSeed.create(4),
    Rng.XorshiftSeed.create(5),
    Rng.XorshiftSeed.create(-1 >>> 0),
    Rng.XorshiftSeed.create(-1),
];
test("(nextInt) returns an integer in range 0 to ((2 ** 32) - 1)", (t) => {
    seeds.forEach((seed) => {
        const [val] = seed.nextInt();
        t.expect(val >= 0).toBe(true);
        t.expect(val <= 2 ** 32 - 1).toBe(true);
    });
});
test("(next) returns a float in range 0 to 1", (t) => {
    seeds.forEach((seed) => {
        const [val] = seed.nextFloat();
        t.expect(val >= 0).toBe(true);
        t.expect(val <= 1).toBe(true);
    });
});
test("(next2) returns two floats in range 0 to 1", (t) => {
    seeds.forEach((seed) => {
        const [val1, val2] = seed.next2Floats();
        t.expect(val1 >= 0).toBe(true);
        t.expect(val1 <= 1).toBe(true);
        t.expect(val2 >= 0).toBe(true);
        t.expect(val2 <= 1).toBe(true);
    });
});
test("(next3) returns three floats in range 0 to 1", (t) => {
    seeds.forEach((seed) => {
        const [val1, val2, val3] = seed.next3Floats();
        t.expect(val1 >= 0).toBe(true);
        t.expect(val1 <= 1).toBe(true);
        t.expect(val2 >= 0).toBe(true);
        t.expect(val2 <= 1).toBe(true);
        t.expect(val3 >= 0).toBe(true);
        t.expect(val3 <= 1).toBe(true);
    });
});
