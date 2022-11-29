import * as WebGL from "../webgl";
import type { HighlightBlock } from "./renderBlockSystem";
declare const Uniforms: {
    readonly u_resolution: WebGL.UniformType.F2;
    readonly u_rgba: WebGL.UniformType.F4;
};
export interface Args {
    readonly uniforms: WebGL.UniformArgs<typeof Uniforms>;
    readonly framebuffer: WebGLFramebuffer;
    readonly blockHighlights: readonly HighlightBlock[];
}
export declare class Shader {
    private readonly program;
    private readonly locations;
    static attributesInfo: WebGL.AttributesInfo;
    static create(gl: WebGLRenderingContext): Shader | null;
    private readonly buffer;
    private array;
    private capacity;
    private constructor();
    render(gl: WebGLRenderingContext, args: Args): void;
    dispose(gl: WebGLRenderingContext): void;
}
export {};
