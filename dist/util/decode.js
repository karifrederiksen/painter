export function ok(value) {
    return { isOk: true, value };
}
export function err() {
    return { isOk: false, value: null };
}
export function bool(val) {
    return typeof val === "boolean" ? ok(val) : err();
}
export function int(val) {
    return typeof val === "number" && Number.isInteger(val) ? ok(val) : err();
}
export function number(val) {
    return typeof val === "number" ? ok(val) : err();
}
export function string(val) {
    return typeof val === "string" ? ok(val) : err();
}
export function nullable(decoder) {
    return (val) => nullable_(decoder, val);
}
function nullable_(decoder, val) {
    return val === null ? ok(null) : decoder(val);
}
export function maybe(decoder) {
    return (val) => maybe_(decoder, val);
}
function maybe_(decoder, val) {
    return val === undefined ? ok(undefined) : decoder(val);
}
export function array(decode) {
    return (val) => array_(decode, val);
}
function array_(decode, val) {
    if (typeof val !== "object" || !Array.isArray(val))
        return err();
    const arr = [];
    for (let i = 0; i < val.length; i++) {
        const res = decode(val[i]);
        if (!res.isOk)
            return err();
        arr.push(res.value);
    }
    return ok(arr);
}
export function object(decoders) {
    return (val) => object_(decoders, val);
}
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
function object_(decoders, val) {
    if (typeof val !== "object")
        return err();
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const resObj = {};
    for (const propName in decoders) {
        // eslint-disable-next-line no-prototype-builtins
        if (!decoders.hasOwnProperty(propName))
            continue;
        const prop = decoders[propName](val[propName]);
        if (!prop.isOk)
            return err();
        resObj[propName] = prop.value;
    }
    return ok(resObj);
}
export function dictionary(decoder) {
    return (val) => dictionary_(decoder, val);
}
function dictionary_(decoder, val_) {
    if (typeof val_ !== "object")
        return err();
    const val = val_;
    const keys = Object.keys(val);
    const res = {};
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = decoder(val[key]);
        if (!value.isOk)
            return err();
        res[key] = value.value;
    }
    return ok(res);
}
export function tuple2(decoder1, decoder2) {
    return (val) => tuple2_(decoder1, decoder2, val);
}
function tuple2_(decoder1, decoder2, val) {
    if (typeof val !== "object" || !Array.isArray(val) || val.length < 2)
        return err();
    const first = decoder1(val[0]);
    if (!first.isOk)
        return err();
    const second = decoder2(val[1]);
    if (!second.isOk)
        return err();
    const tup = [first.value, second.value];
    return ok(tup);
}
function tuple3_(decoder1, decoder2, decoder3, val) {
    if (typeof val !== "object" || !Array.isArray(val) || val.length < 3)
        return err();
    const first = decoder1(val[0]);
    if (!first.isOk)
        return err();
    const second = decoder2(val[1]);
    if (!second.isOk)
        return err();
    const third = decoder3(val[2]);
    if (!third.isOk)
        return err();
    const tup = [first.value, second.value, third.value];
    return ok(tup);
}
export function tuple3(decoder1, decoder2, decoder3) {
    return (val) => tuple3_(decoder1, decoder2, decoder3, val);
}
export function oneOf(decoders) {
    return (val) => oneOf_(decoders, val);
}
function oneOf_(decoders, val) {
    for (let i = 0; i < decoders.length; i++) {
        const res = decoders[i](val);
        if (res.isOk)
            return res;
    }
    return err();
}
export function map(decoder, transform) {
    return (val) => map_(decoder, transform, val);
}
function map_(decoder, transform, val) {
    const res = decoder(val);
    return res.isOk ? ok(transform(res.value)) : err();
}
export function filter(decoder, predicate) {
    return (val) => filter_(decoder, predicate, val);
}
function filter_(decoder, predicate, val) {
    const res = decoder(val);
    if (!res.isOk)
        return res;
    if (predicate(res.value))
        return res;
    return err();
}
export function extend(decoder, transform) {
    return (val) => extend_(decoder, transform, val);
}
function extend_(decoder, transform, val) {
    const baseRes = decoder(val);
    return baseRes.isOk ? transform(baseRes.value) : err();
}
// Laziness is required for circularly defined data
export function lazy(lazyDecoder) {
    return (val) => lazyDecoder()(val);
}
export function createJsonDecoder(decoder) {
    return (json) => decodeJson(decoder, json);
}
function decodeJson(decoder, json) {
    try {
        return decoder(JSON.parse(json));
    }
    catch (ex) {
        console.error(ex);
        return err();
    }
}
export function decodeValue(decoder, value) {
    return decoder(value);
}
