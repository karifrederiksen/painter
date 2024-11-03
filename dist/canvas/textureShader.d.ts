import * as WebGL from "../webgl/index.js";
declare const Uniforms: {
    readonly u_texture: WebGL.UniformType.I1;
    readonly u_resolution: WebGL.UniformType.F2;
    readonly u_opacity: WebGL.UniformType.F1;
};
export interface Args {
    readonly uniforms: WebGL.UniformArgs<typeof Uniforms>;
    readonly framebuffer: WebGLFramebuffer;
    readonly blocks: readonly {
        readonly x0: number;
        readonly y0: number;
        readonly x1: number;
        readonly y1: number;
    }[];
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
