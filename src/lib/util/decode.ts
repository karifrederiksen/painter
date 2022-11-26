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

export function ok<a>(value: a): DecodeResult<a> {
  return { isOk: true, value };
}

export function err<a extends never>(): DecodeResult<a> {
  return { isOk: false, value: null };
}

export function bool(val: unknown): DecodeResult<boolean> {
  return typeof val === "boolean" ? ok(val) : err();
}

export function int(val: unknown): DecodeResult<number> {
  return typeof val === "number" && Number.isInteger(val) ? ok(val) : err();
}

export function number(val: unknown): DecodeResult<number> {
  return typeof val === "number" ? ok(val) : err();
}

export function string(val: unknown): DecodeResult<string> {
  return typeof val === "string" ? ok(val) : err();
}

export function nullable<a>(decoder: DecoderBlock<a>): DecoderBlock<a | null> {
  return (val) => nullable_(decoder, val);
}

function nullable_<a>(decoder: DecoderBlock<a>, val: unknown): DecodeResult<a | null> {
  return val === null ? ok(null) : decoder(val);
}

export function maybe<a>(decoder: DecoderBlock<a>): DecoderBlock<a | undefined> {
  return (val) => maybe_(decoder, val);
}

function maybe_<a>(decoder: DecoderBlock<a>, val: unknown): DecodeResult<a | undefined> {
  return val === undefined ? ok(undefined) : decoder(val);
}

export function array<a>(decode: DecoderBlock<a>): DecoderBlock<a[]> {
  return (val) => array_(decode, val);
}

function array_<a>(decode: DecoderBlock<a>, val: unknown): DecodeResult<a[]> {
  if (typeof val !== "object" || !Array.isArray(val)) return err();

  const arr: a[] = [];

  for (let i = 0; i < val.length; i++) {
    const res = decode(val[i]);
    if (!res.isOk) return err();
    arr.push(res.value);
  }

  return ok(arr);
}

export type ObjectProps<a> = { readonly [propName in keyof a]: DecoderBlock<a[propName]> };

export function object<a>(decoders: ObjectProps<a>): DecoderBlock<a> {
  return (val) => object_(decoders, val);
}

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
function object_<a>(decoders: ObjectProps<a>, val: any): DecodeResult<a> {
  if (typeof val !== "object") return err();

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const resObj: any = {};
  for (const propName in decoders) {
    // eslint-disable-next-line no-prototype-builtins
    if (!decoders.hasOwnProperty(propName)) continue;

    const prop = decoders[propName](val[propName]);
    if (!prop.isOk) return err();

    resObj[propName] = prop.value;
  }

  return ok(resObj);
}

export function dictionary<a>(decoder: DecoderBlock<a>): DecoderBlock<{ [key: string]: a }> {
  return (val) => dictionary_(decoder, val);
}

function dictionary_<a>(
  decoder: DecoderBlock<a>,
  val_: unknown,
): DecodeResult<{ [key: string]: a }> {
  if (typeof val_ !== "object") return err();

  const val = val_ as { readonly [key: string]: unknown };

  const keys = Object.keys(val as object);

  const res: { [key: string]: a } = {};

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = decoder(val[key]);
    if (!value.isOk) return err();

    res[key] = value.value;
  }

  return ok(res);
}

export function tuple2<a, b>(
  decoder1: DecoderBlock<a>,
  decoder2: DecoderBlock<b>,
): DecoderBlock<[a, b]> {
  return (val) => tuple2_(decoder1, decoder2, val);
}

function tuple2_<a, b>(
  decoder1: DecoderBlock<a>,
  decoder2: DecoderBlock<b>,
  val: unknown,
): DecodeResult<[a, b]> {
  if (typeof val !== "object" || !Array.isArray(val) || val.length < 2) return err();

  const first = decoder1(val[0]);
  if (!first.isOk) return err();

  const second = decoder2(val[1]);
  if (!second.isOk) return err();

  const tup: [a, b] = [first.value, second.value];
  return ok(tup);
}

function tuple3_<a, b, c>(
  decoder1: DecoderBlock<a>,
  decoder2: DecoderBlock<b>,
  decoder3: DecoderBlock<c>,
  val: unknown,
): DecodeResult<[a, b, c]> {
  if (typeof val !== "object" || !Array.isArray(val) || val.length < 3) return err();

  const first = decoder1(val[0]);
  if (!first.isOk) return err();

  const second = decoder2(val[1]);
  if (!second.isOk) return err();

  const third = decoder3(val[2]);
  if (!third.isOk) return err();

  const tup: [a, b, c] = [first.value, second.value, third.value];
  return ok(tup);
}

export function tuple3<a, b, c>(
  decoder1: DecoderBlock<a>,
  decoder2: DecoderBlock<b>,
  decoder3: DecoderBlock<c>,
): DecoderBlock<[a, b, c]> {
  return (val) => tuple3_(decoder1, decoder2, decoder3, val);
}

export function oneOf<a>(decoders: readonly DecoderBlock<a>[]): DecoderBlock<a> {
  return (val) => oneOf_(decoders, val);
}

function oneOf_<a>(decoders: readonly DecoderBlock<a>[], val: unknown): DecodeResult<a> {
  for (let i = 0; i < decoders.length; i++) {
    const res = decoders[i](val);
    if (res.isOk) return res;
  }
  return err();
}

export function map<a, b>(decoder: DecoderBlock<a>, transform: (val: a) => b): DecoderBlock<b> {
  return (val) => map_(decoder, transform, val);
}

function map_<a, b>(
  decoder: DecoderBlock<a>,
  transform: (val: a) => b,
  val: unknown,
): DecodeResult<b> {
  const res = decoder(val);
  return res.isOk ? ok(transform(res.value)) : err();
}

export function filter<a>(
  decoder: DecoderBlock<a>,
  predicate: (val: a) => boolean,
): DecoderBlock<a> {
  return (val) => filter_(decoder, predicate, val);
}

function filter_<a>(
  decoder: DecoderBlock<a>,
  predicate: (val: a) => boolean,
  val: unknown,
): DecodeResult<a> {
  const res = decoder(val);
  if (!res.isOk) return res;

  if (predicate(res.value)) return res;

  return err();
}

export function extend<a, b>(
  decoder: DecoderBlock<a>,
  transform: (val: a) => DecodeResult<b>,
): DecoderBlock<b> {
  return (val) => extend_(decoder, transform, val);
}

function extend_<a, b>(
  decoder: DecoderBlock<a>,
  transform: (val: a) => DecodeResult<b>,
  val: unknown,
): DecodeResult<b> {
  const baseRes = decoder(val);
  return baseRes.isOk ? transform(baseRes.value) : err();
}

// Laziness is required for circularly defined data
export function lazy<a>(lazyDecoder: () => DecoderBlock<a>): DecoderBlock<a> {
  return (val) => lazyDecoder()(val);
}

export function createJsonDecoder<a>(decoder: DecoderBlock<a>): (json: string) => DecodeResult<a> {
  return (json) => decodeJson(decoder, json);
}

function decodeJson<a>(decoder: DecoderBlock<a>, json: string): DecodeResult<a> {
  try {
    return decoder(JSON.parse(json));
  } catch (ex) {
    console.error(ex);
    return err();
  }
}

export function decodeValue<a>(decoder: DecoderBlock<a>, value: unknown): DecodeResult<a> {
  return decoder(value);
}
