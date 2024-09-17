export class Seed {
    nextInt() {
        return [this.asInt(), this.step()];
    }
    nextFloat() {
        const floatResult = this.asInt() / 4294967295;
        return [floatResult, this.step()];
    }
    next2Floats() {
        const [first, state2] = this.nextFloat();
        const [second, state3] = state2.nextFloat();
        return [first, second, state3];
    }
    next3Floats() {
        const [first, state2] = this.nextFloat();
        const [second, state3] = state2.nextFloat();
        const [third, state4] = state3.nextFloat();
        return [first, second, third, state4];
    }
}
/*
 * Implementation of Xorshift 128
 * https://en.wikipedia.org/wiki/Xorshift
 */
export class XorshiftSeed extends Seed {
    a;
    b;
    c;
    d;
    value;
    static create(n) {
        let seed = new XorshiftSeed(n, 0, 0, 0, null);
        for (let i = 0; i < 32; i++) {
            seed = seed.step();
        }
        return seed;
    }
    constructor(a, b, c, d, value) {
        super();
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.value = value;
    }
    asInt() {
        return this.force().asInt;
    }
    step() {
        return this.force().next;
    }
    display() {
        return `Xorshift 128 (${this.a}, ${this.b}, ${this.c}, ${this.d})`;
    }
    force() {
        if (this.value === null) {
            const s = this.a;
            let t = this.d;
            t ^= t << 11;
            t ^= t >>> 8;
            t ^= s;
            t ^= s >>> 19;
            this.value = {
                asInt: t >>> 0,
                next: new XorshiftSeed(t, s, this.b, this.c, null),
            };
        }
        return this.value;
    }
}
