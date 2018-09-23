export const enum Mode {
    Normal,
    Erase,
}

export interface Args {
    readonly sfact: number
    readonly dfact: number
}

export interface ModeMap {
    readonly [Mode.Normal]: Args
    readonly [Mode.Erase]: Args
}

export const modeMap: ModeMap = {
    [Mode.Normal]: {
        sfact: WebGLRenderingContext.ONE,
        dfact: WebGLRenderingContext.ONE_MINUS_SRC_ALPHA,
    },
    [Mode.Erase]: {
        sfact: WebGLRenderingContext.ZERO,
        dfact: WebGLRenderingContext.ONE_MINUS_SRC_ALPHA,
    },
}
