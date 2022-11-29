import * as WebGL from "../webgl";
import type { Vec2 } from "../util";
declare const Uniforms: {
    readonly u_softness: WebGL.UniformType.F1;
};
export interface Args {
    readonly uniforms: WebGL.UniformArgs<typeof Uniforms>;
    readonly framebuffer: WebGLFramebuffer;
    readonly size: Vec2;
}
export declare class Generator {
    readonly program: WebGLProgram;
    private readonly locations;
    static create(gl: WebGLRenderingContext): Generator | null;
    private readonly buffer;
    private readonly array;
    private constructor();
    generateBrushTexture(gl: WebGLRenderingContext, args: Args): void;
    dispose(gl: WebGLRenderingContext): void;
}
export {};
