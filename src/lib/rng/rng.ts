export abstract class Seed {
  abstract asInt(): number;

  abstract step(): Seed;

  abstract display(): string;

  nextInt(): [number, Seed] {
    return [this.asInt(), this.step()];
  }

  nextFloat(): [number, Seed] {
    const floatResult = this.asInt() / 4294967295;
    return [floatResult, this.step()];
  }

  next2Floats(): [number, number, Seed] {
    const [first, state2] = this.nextFloat();
    const [second, state3] = state2.nextFloat();
    return [first, second, state3];
  }

  next3Floats(): [number, number, number, Seed] {
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
  static create(n: number): Seed {
    let seed: Seed = new XorshiftSeed(n, 0, 0, 0, null);
    for (let i = 0; i < 32; i++) {
      seed = seed.step();
    }
    return seed;
  }

  private constructor(
    private readonly a: number,
    private readonly b: number,
    private readonly c: number,
    private readonly d: number,
    private value: null | {
      readonly next: XorshiftSeed;
      readonly asInt: number;
    },
  ) {
    super();
  }

  asInt(): number {
    return this.force().asInt;
  }

  step(): Seed {
    return this.force().next;
  }

  display(): string {
    return `Xorshift 128 (${this.a}, ${this.b}, ${this.c}, ${this.d})`;
  }

  private force(): {
    readonly next: XorshiftSeed;
    readonly asInt: number;
  } {
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
