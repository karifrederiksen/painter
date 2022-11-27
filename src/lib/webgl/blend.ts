export const enum Mode {
    Normal,
    Erase,
}

export interface Factors {
    readonly sfact: number;
    readonly dfact: number;
}

export const factorsNormal = (gl: WebGLRenderingContext): Factors => ({
    sfact: gl.ONE,
    dfact: gl.ONE_MINUS_SRC_ALPHA,
});

export const factorsErase = (gl: WebGLRenderingContext): Factors => ({
    sfact: gl.ZERO,
    dfact: gl.ONE_MINUS_SRC_ALPHA,
});

export function getFactors(gl: WebGLRenderingContext, mode: Mode): Factors {
    switch (mode) {
        case Mode.Normal:
            return factorsNormal(gl);
        case Mode.Erase:
            return factorsErase(gl);
    }
}
