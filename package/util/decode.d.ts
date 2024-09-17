export interface DecodeOk<a> {
    readonly isOk: true;
    readonly value: a;
}
export interface DecodeErr {
    readonly isOk: false;
    readonly value: null;
}
export type DecodeResult<a> = DecodeOk<a> | DecodeErr;
export type DecoderBlock<a> = (val: unknown) => DecodeResult<a>;
export declare function ok<a>(value: a): DecodeResult<a>;
export declare function err<a extends never>(): DecodeResult<a>;
export declare function bool(val: unknown): DecodeResult<boolean>;
export declare function int(val: unknown): DecodeResult<number>;
export declare function number(val: unknown): DecodeResult<number>;
export declare function string(val: unknown): DecodeResult<string>;
export declare function nullable<a>(decoder: DecoderBlock<a>): DecoderBlock<a | null>;
export declare function maybe<a>(decoder: DecoderBlock<a>): DecoderBlock<a | undefined>;
export declare function array<a>(decode: DecoderBlock<a>): DecoderBlock<a[]>;
export type ObjectProps<a> = {
    readonly [propName in keyof a]: DecoderBlock<a[propName]>;
};
export declare function object<a>(decoders: ObjectProps<a>): DecoderBlock<a>;
export declare function dictionary<a>(decoder: DecoderBlock<a>): DecoderBlock<{
    [key: string]: a;
}>;
export declare function tuple2<a, b>(decoder1: DecoderBlock<a>, decoder2: DecoderBlock<b>): DecoderBlock<[a, b]>;
export declare function tuple3<a, b, c>(decoder1: DecoderBlock<a>, decoder2: DecoderBlock<b>, decoder3: DecoderBlock<c>): DecoderBlock<[a, b, c]>;
export declare function oneOf<a>(decoders: readonly DecoderBlock<a>[]): DecoderBlock<a>;
export declare function map<a, b>(decoder: DecoderBlock<a>, transform: (val: a) => b): DecoderBlock<b>;
export declare function filter<a>(decoder: DecoderBlock<a>, predicate: (val: a) => boolean): DecoderBlock<a>;
export declare function extend<a, b>(decoder: DecoderBlock<a>, transform: (val: a) => DecodeResult<b>): DecoderBlock<b>;
export declare function lazy<a>(lazyDecoder: () => DecoderBlock<a>): DecoderBlock<a>;
export declare function createJsonDecoder<a>(decoder: DecoderBlock<a>): (json: string) => DecodeResult<a>;
export declare function decodeValue<a>(decoder: DecoderBlock<a>, value: unknown): DecodeResult<a>;
