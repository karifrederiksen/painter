import * as WebGL from "../webgl/index.js";
import type { Block } from "./renderBlockSystem.js";
declare const Uniforms: {
    readonly u_resolution: WebGL.UniformType.F2;
    readonly u_rgba: WebGL.UniformType.F4;
};
export interface Args {
    readonly uniforms: WebGL.UniformArgs<typeof Uniforms>;
    readonly framebuffer: WebGLFramebuffer;
    readonly blocks: readonly Block[];
}
export declare class Shader {
    private readonly program;
    private readonly locations;
    static create(gl: WebGLRenderingContext): Shader | null;
    private readonly buffer;
    private array;
    private capacity;
    private constructor();
    render(gl: WebGLRenderingContext, args: Args): void;
    dispose(gl: WebGLRenderingContext): void;
}
export {};
