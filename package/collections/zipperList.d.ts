export declare class ZipperList<a> {
    private readonly __left;
    readonly focus: a;
    private readonly __right;
    static singleton<a>(value: a): ZipperList<a>;
    static fromArray<a>(arr: readonly a[]): ZipperList<a> | null;
    static unsafeFromArray<a>(arr: readonly a[]): ZipperList<a>;
    private constructor();
    getLeft(): a[];
    getRight(): a[];
    hasLeft(): boolean;
    hasRight(): boolean;
    focusLeft(): ZipperList<a>;
    focusRight(): ZipperList<a>;
    focusf(f: (val: a) => boolean): ZipperList<a>;
    toArray(): a[];
}
