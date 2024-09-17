export declare abstract class Seed {
    abstract asInt(): number;
    abstract step(): Seed;
    abstract display(): string;
    nextInt(): [number, Seed];
    nextFloat(): [number, Seed];
    next2Floats(): [number, number, Seed];
    next3Floats(): [number, number, number, Seed];
}
export declare class XorshiftSeed extends Seed {
    private readonly a;
    private readonly b;
    private readonly c;
    private readonly d;
    private value;
    static create(n: number): Seed;
    private constructor();
    asInt(): number;
    step(): Seed;
    display(): string;
    private force;
}
