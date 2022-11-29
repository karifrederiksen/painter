import type * as Color from "color";
import * as WebGL from "../webgl/index.js";
import { Vec2, Vec4 } from "../util/index.js";
export interface BrushPoint {
    readonly color: Color.RgbLinear;
    readonly alpha: number;
    readonly position: Vec2;
    readonly scaledDiameter: number;
    readonly rotation: number;
}
declare const Uniforms: {
    readonly u_resolution: WebGL.UniformType.F2;
    readonly u_texture: WebGL.UniformType.I1;
};
export interface Args {
    readonly uniforms: WebGL.UniformArgs<typeof Uniforms>;
    readonly blendMode: WebGL.Blend.Mode;
}
export declare class Shader {
    private gl;
    readonly program: WebGLProgram;
    private readonly locations;
    static create(gl: WebGLRenderingContext): Shader | null;
    private readonly buffer;
    private array;
    private offset;
    private affectedArea;
    private constructor();
    get canFlush(): boolean;
    addPoints(points: readonly BrushPoint[]): void;
    getAffectedArea(): Vec4;
    flush(gl: WebGLRenderingContext, args: Args): void;
    dispose(gl: WebGLRenderingContext): void;
}
export {};
