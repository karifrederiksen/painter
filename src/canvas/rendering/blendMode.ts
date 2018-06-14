export const enum BlendMode {
    Normal,
    Erase
}

export interface BlendModeArgs {
    readonly sfact: number
    readonly dfact: number
}

export interface BlendModeMap {
    readonly [BlendMode.Normal]: BlendModeArgs
    readonly [BlendMode.Erase]: BlendModeArgs
    
}

export const blendModeMap: BlendModeMap = {
    [BlendMode.Normal]: {
        sfact: WebGLRenderingContext.ONE,
        dfact: WebGLRenderingContext.ONE_MINUS_SRC_ALPHA,
    },
    [BlendMode.Erase]: {
        sfact: WebGLRenderingContext.ZERO,
        dfact: WebGLRenderingContext.ONE_MINUS_SRC_ALPHA,
    },
}
