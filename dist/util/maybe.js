export function of(val) {
    if (val == null)
        return [];
    return [val];
}
export function withDefault(val, def) {
    if (val.length === 0)
        return def;
    return val[0];
}
export function withDefaultf(val, def) {
    if (val.length === 0)
        return def();
    return val[0];
}
export function map(val, f) {
    if (val.length === 0)
        return [];
    return [f(val[0])];
}
export function map2(val1, val2, f) {
    if (val1.length === 0 || val2.length === 0)
        return [];
    return [f(val1[0], val2[0])];
}
export function map3(val1, val2, val3, f) {
    if (val1.length === 0 || val2.length === 0 || val3.length === 0)
        return [];
    return [f(val1[0], val2[0], val3[0])];
}
export function andThen(val, f) {
    if (val.length === 0)
        return [];
    return f(val[0]);
}
