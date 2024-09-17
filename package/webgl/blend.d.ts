export declare const enum Mode {
    Normal = 0,
    Erase = 1
}
export interface Factors {
    readonly sfact: number;
    readonly dfact: number;
}
export declare const factorsNormal: (gl: WebGLRenderingContext) => Factors;
export declare const factorsErase: (gl: WebGLRenderingContext) => Factors;
export declare function getFactors(gl: WebGLRenderingContext, mode: Mode): Factors;
