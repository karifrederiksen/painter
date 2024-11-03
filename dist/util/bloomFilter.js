function from(x) {
    return x;
}
function to(x) {
    return x;
}
export const empty = 0;
export function add(filter, value) {
    return to(from(filter) | value);
}
export function mightHave(filter, value) {
    return (from(filter) & value) > 0;
}
/* eslint-enable @typescript-eslint/no-explicit-any */
