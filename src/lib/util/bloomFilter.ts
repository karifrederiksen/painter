// a limitation of this bloomfilter is that it can't contain 0
/* eslint-disable @typescript-eslint/no-explicit-any */
export declare class Bloomfilter {
    private _: void;
}

function from(x: Bloomfilter): number {
    return x as any;
}
function to(x: number): Bloomfilter {
    return x as any;
}

export const empty: Bloomfilter = 0 as any;

export function add(filter: Bloomfilter, value: number): Bloomfilter {
    return to(from(filter) | value);
}

export function mightHave(filter: Bloomfilter, value: number): boolean {
    return (from(filter) & value) > 0;
}
/* eslint-enable @typescript-eslint/no-explicit-any */
