import type { Vec2, Vec3, Vec4 } from "../util";

export * from "./glsl";
export * as Blend from "./blend";

export function createProgram(
    gl: WebGLRenderingContext,
    vSrc: string,
    fSrc: string,
): WebGLProgram | null {
    const vShader = compileShader(gl, vSrc, gl.VERTEX_SHADER);
    const fShader = compileShader(gl, fSrc, gl.FRAGMENT_SHADER);

    if (vShader === null || fShader === null) {
        return null;
    }

    const program = gl.createProgram();

    if (program === null) {
        console.error("Failed to create program");
        return null;
    }

    gl.attachShader(program, vShader);
    gl.attachShader(program, fShader);

    const linkedProgram = linkProgram(gl, program);

    gl.deleteShader(vShader);
    gl.deleteShader(fShader);

    return linkedProgram;
}

function compileShader(gl: WebGLRenderingContext, src: string, shaderType: number) {
    const shader = gl.createShader(shaderType);
    if (shader === null) {
        console.error("Failed to create shader.");
        return null;
    }
    gl.shaderSource(shader, src);
    gl.compileShader(shader);

    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;

    console.group("Failed to compile shader");
    console.error("shader info log: ", gl.getShaderInfoLog(shader));
    const prettySrc = withNumberedLines(src);
    console.info(prettySrc);
    console.groupEnd();
    gl.deleteShader(shader);
    return null;
}

function linkProgram(gl: WebGLRenderingContext, program: WebGLProgram): WebGLProgram | null {
    gl.linkProgram(program);
    if (program !== null || gl.getProgramParameter(program, gl.LINK_STATUS)) return program;

    console.group("Failed to link program");
    console.error("error: ", gl.getError());
    console.info("validate status: ", gl.getProgramParameter(program, gl.VALIDATE_STATUS));
    console.info("program info log: ", gl.getProgramInfoLog(program));
    console.groupEnd();

    gl.deleteProgram(program);
    return null;
}

function withNumberedLines(src: string): string {
    const lines = src.split("\n");

    const lineNumberLength = lines.length.toString().length;

    return lines
        .map((line, index) => padStart(index.toString(10), lineNumberLength, "0") + "| " + line)
        .join("\n");
}

function padStart(text: string, length: number, fillChar: string): string {
    const padCount = length - text.length;
    if (padCount <= 0) return text;

    const pad = [];
    for (let i = 0; i < padCount; i++) pad.push(fillChar);
    pad.push(text);
    return pad.join("");
}

export const enum UniformType {
    I1,
    F1,
    F2,
    F3,
    F4,
}

export type UniformNames<a> = { readonly [key in keyof a]: UniformType };

export type UniformsInfo<a extends UniformNames<a>> = { readonly [key in keyof a]: Uniform };

export class Uniform {
    constructor(readonly location: WebGLUniformLocation, readonly type: UniformType) {}
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

export function getUniformLocation<a extends UniformNames<a>>(
    gl: WebGLRenderingContext,
    program: WebGLProgram,
    uniforms: UniformNames<a>,
): UniformsInfo<a> | null {
    const result: any = {};
    const notFound: string[] = [];
    for (const propName in uniforms) {
        // eslint-disable-next-line no-prototype-builtins
        if (!uniforms.hasOwnProperty(propName)) {
            continue;
        }
        const textureLoc = gl.getUniformLocation(program, propName);
        if (textureLoc === null) {
            notFound.push(propName);
        } else {
            result[propName] = new Uniform(textureLoc, uniforms[propName]);
        }
    }

    if (notFound.length === 0) {
        return result as UniformsInfo<a>;
    }

    let msg = "Failed to find location for uniforms";

    for (let i = 0; i < notFound.length; i++) {
        msg += "\n - " + notFound[i];
    }

    console.error(msg);
    return null;
}

export function updateUniforms<a extends UniformNames<a>>(
    gl: WebGLRenderingContext,
    uniforms: UniformsInfo<a>,
    args: UniformArgs<a>,
) {
    for (const propName in uniforms) {
        // eslint-disable-next-line no-prototype-builtins
        if (!args.hasOwnProperty(propName)) {
            continue;
        }
        const uniform = uniforms[propName];
        switch (uniform.type) {
            case UniformType.I1: {
                const arg = args[propName] as number;
                gl.uniform1i(uniform.location, arg);
                break;
            }
            case UniformType.F1: {
                const arg = args[propName] as number;
                gl.uniform1f(uniform.location, arg);
                break;
            }
            case UniformType.F2: {
                const arg = args[propName] as Vec2;
                gl.uniform2f(uniform.location, arg.x, arg.y);
                break;
            }
            case UniformType.F3: {
                const arg = args[propName] as Vec3;
                gl.uniform3f(uniform.location, arg.x, arg.y, arg.z);
                break;
            }
            case UniformType.F4: {
                const arg = args[propName] as Vec4;
                gl.uniform4f(uniform.location, arg.x, arg.y, arg.z, arg.w);
                break;
            }
            default: {
                const never: never = uniform.type;
                throw { "unexpected type": uniform };
            }
        }
    }
}

// Not using anything but float current, but this will allow us to easily add other types later
export enum AttribType {
    Float,
}

export interface Attrib {
    readonly name: string;
    readonly size: number;
    readonly type: AttribType;
}

class AttribInternal {
    readonly name: string;
    readonly size: number;
    readonly glType: number;
    readonly bytes: number;

    constructor(gl: WebGLRenderingContext, attrib: Attrib) {
        this.name = attrib.name;
        this.size = attrib.size;
        switch (attrib.type) {
            case AttribType.Float:
                this.glType = gl.FLOAT;
                this.bytes = attrib.size * 4;
                break;
            default: {
                const never: never = attrib.type;
                throw { "Unexpected type on attribute": attrib };
            }
        }
    }
}

export class AttributesInfo {
    readonly size: number;
    readonly stride: number;
    readonly attributes: readonly AttribInternal[];

    constructor(gl: WebGLRenderingContext, attributes: readonly Attrib[]) {
        {
            const attributes_ = new Array<AttribInternal>(attributes.length);
            for (let i = 0; i < attributes.length; i++) {
                const attrib = attributes[i];
                attributes_[i] = new AttribInternal(gl, attrib);
            }
            this.attributes = attributes_;
        }
        {
            let totalSize = 0;
            for (let i = 0; i < this.attributes.length; i++) {
                totalSize += this.attributes[i].size;
            }
            this.size = totalSize;
            this.stride = totalSize * 4;
        }
    }

    bindAttribLocations(gl: WebGLRenderingContext, program: WebGLProgram): void {
        const { attributes } = this;
        for (let i = 0; i < attributes.length; i++) {
            gl.bindAttribLocation(program, i, attributes[i].name);
        }
    }

    vertexAttrib(gl: WebGLRenderingContext): void {
        const { attributes } = this;

        let sizeOffset = 0;
        for (let i = 0; i < attributes.length; i++) {
            const attrib = attributes[i];
            gl.vertexAttribPointer(i, attrib.size, attrib.glType, false, this.stride, sizeOffset);
            sizeOffset += attrib.bytes;
        }

        for (let i = 0; i < attributes.length; i++) {
            gl.enableVertexAttribArray(i);
        }
    }

    getDrawCount(offset: number): number {
        return offset / this.size;
    }
}
