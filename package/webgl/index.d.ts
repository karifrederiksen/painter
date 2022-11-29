import type { Vec2, Vec3, Vec4 } from "../util";
export * from "./glsl";
export * as Blend from "./blend";
export declare function createProgram(gl: WebGLRenderingContext, vSrc: string, fSrc: string): WebGLProgram | null;
export declare const enum UniformType {
    I1 = 0,
    F1 = 1,
    F2 = 2,
    F3 = 3,
    F4 = 4
}
export type UniformNames<a> = {
    readonly [key in keyof a]: UniformType;
};
export type UniformsInfo<a extends UniformNames<a>> = {
    readonly [key in keyof a]: Uniform;
};
export declare class Uniform {
    readonly location: WebGLUniformLocation;
    readonly type: UniformType;
    constructor(location: WebGLUniformLocation, type: UniformType);
}
export interface UniformArgMap {
    readonly [UniformType.I1]: number;
    readonly [UniformType.F1]: number;
    readonly [UniformType.F2]: Vec2;
    readonly [UniformType.F3]: Vec3;
    readonly [UniformType.F4]: Vec4;
}
export type UniformArgs<a extends UniformNames<a>> = {
    readonly [key in keyof a]: UniformArgMap[a[key]];
};
export declare function getUniformLocation<a extends UniformNames<a>>(gl: WebGLRenderingContext, program: WebGLProgram, uniforms: UniformNames<a>): UniformsInfo<a> | null;
export declare function updateUniforms<a extends UniformNames<a>>(gl: WebGLRenderingContext, uniforms: UniformsInfo<a>, args: UniformArgs<a>): void;
export declare enum AttribType {
    Float = 0
}
export interface Attrib {
    readonly name: string;
    readonly size: number;
    readonly type: AttribType;
}
declare class AttribInternal {
    readonly name: string;
    readonly size: number;
    readonly glType: number;
    readonly bytes: number;
    constructor(gl: WebGLRenderingContext, attrib: Attrib);
}
export declare class AttributesInfo {
    readonly size: number;
    readonly stride: number;
    readonly attributes: readonly AttribInternal[];
    constructor(gl: WebGLRenderingContext, attributes: readonly Attrib[]);
    bindAttribLocations(gl: WebGLRenderingContext, program: WebGLProgram): void;
    vertexAttrib(gl: WebGLRenderingContext): void;
    getDrawCount(offset: number): number;
}
