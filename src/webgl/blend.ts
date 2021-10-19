export const enum Mode {
    Normal,
    Erase,
}

export interface Factors {
    readonly sfact: number
    readonly dfact: number
}

export const factorsNormal = {
    sfact: WebGLRenderingContext.ONE,
    dfact: WebGLRenderingContext.ONE_MINUS_SRC_ALPHA,
}

export const factorsErase = {
    sfact: WebGLRenderingContext.ZERO,
    dfact: WebGLRenderingContext.ONE_MINUS_SRC_ALPHA,
}

export function getFactors(mode: Mode): Factors {
    switch (mode) {
        case Mode.Normal:
            return factorsNormal
        case Mode.Erase:
            return factorsErase
    }
}
