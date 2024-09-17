export declare class Bloomfilter {
    private _;
}
export declare const empty: Bloomfilter;
export declare function add(filter: Bloomfilter, value: number): Bloomfilter;
export declare function mightHave(filter: Bloomfilter, value: number): boolean;
