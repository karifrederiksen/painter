export var Mode;
(function (Mode) {
    Mode[Mode["Normal"] = 0] = "Normal";
    Mode[Mode["Erase"] = 1] = "Erase";
})(Mode || (Mode = {}));
export const factorsNormal = (gl) => ({
    sfact: gl.ONE,
    dfact: gl.ONE_MINUS_SRC_ALPHA,
});
export const factorsErase = (gl) => ({
    sfact: gl.ZERO,
    dfact: gl.ONE_MINUS_SRC_ALPHA,
});
export function getFactors(gl, mode) {
    switch (mode) {
        case Mode.Normal:
            return factorsNormal(gl);
        case Mode.Erase:
            return factorsErase(gl);
    }
}
