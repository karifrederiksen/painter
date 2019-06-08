export * from "./glsl"

export function createProgram(
    gl: WebGLRenderingContext,
    vSrc: string,
    fSrc: string
): WebGLProgram | null {
    const vShader = compileShader(gl, vSrc, WebGLRenderingContext.VERTEX_SHADER)
    const fShader = compileShader(gl, fSrc, WebGLRenderingContext.FRAGMENT_SHADER)

    if (vShader === null || fShader === null) {
        return null
    }

    const program = gl.createProgram()

    if (program === null) {
        console.error("Failed to create program")
        return null
    }

    gl.attachShader(program, vShader)
    gl.attachShader(program, fShader)

    const linkedProgram = linkProgram(gl, program)

    gl.deleteShader(vShader)
    gl.deleteShader(fShader)

    return linkedProgram
}

function compileShader(gl: WebGLRenderingContext, src: string, shaderType: number) {
    const shader = gl.createShader(shaderType)
    if (shader === null) {
        console.error("Failed to create shader.")
        return null
    }
    gl.shaderSource(shader, src)
    gl.compileShader(shader)

    if (gl.getShaderParameter(shader, WebGLRenderingContext.COMPILE_STATUS)) return shader

    console.group("Failed to compile shader")
    console.error("shader info log: ", gl.getShaderInfoLog(shader))
    const prettySrc = withNumberedLines(src)
    console.log(prettySrc)
    console.groupEnd()
    gl.deleteShader(shader)
    return null
}

function linkProgram(gl: WebGLRenderingContext, program: WebGLProgram): WebGLProgram | null {
    gl.linkProgram(program)
    if (program !== null || gl.getProgramParameter(program, WebGLRenderingContext.LINK_STATUS))
        return program

    console.group("Failed to link program")
    console.error("error: ", gl.getError())
    console.log(
        "validate status: ",
        gl.getProgramParameter(program, WebGLRenderingContext.VALIDATE_STATUS)
    )
    console.log("program info log: ", gl.getProgramInfoLog(program))
    console.groupEnd()

    gl.deleteProgram(program)
    return null
}

function withNumberedLines(src: string): string {
    const lines = src.split("\n")

    const lineNumberLength = lines.length.toString().length

    return lines
        .map((line, index) => padStart(index.toString(10), lineNumberLength, "0") + "| " + line)
        .join("\n")
}

function padStart(text: string, length: number, fillChar: string): string {
    const padCount = length - text.length
    if (padCount <= 0) return text

    const pad = []
    for (let i = 0; i < padCount; i++) pad.push(fillChar)
    pad.push(text)
    return pad.join("")
}

export type UniformNames<a> = { readonly [key in keyof a]: true }

export type Uniforms<a> = { readonly [key in keyof a]: WebGLUniformLocation }

export function getUniformLocation<a>(
    gl: WebGLRenderingContext,
    program: WebGLProgram,
    uniforms: UniformNames<a>
): Uniforms<a> | null {
    const result: any = {}
    const notFound: string[] = []
    for (const propName in uniforms) {
        if (!uniforms.hasOwnProperty(propName)) continue
        const textureLoc = gl.getUniformLocation(program, propName)
        if (textureLoc === null) {
            notFound.push(propName)
        }
        result[propName] = textureLoc
    }

    if (notFound.length === 0) {
        return result as Uniforms<a>
    }

    let msg = "Failed to find location for uniforms"

    for (let i = 0; i < notFound.length; i++) {
        msg += "\n - " + notFound[i]
    }

    console.error(msg)
    return null
}

// Not using anything but float current, but this will allow us to easily add other types later
export enum AttribType {
    Float,
}

export interface Attrib {
    readonly name: string
    readonly size: number
    readonly type: AttribType
}

class AttribInternal {
    readonly name: string
    readonly size: number
    readonly glType: number
    readonly bytes: number

    constructor(attrib: Attrib) {
        this.name = attrib.name
        this.size = attrib.size
        switch (attrib.type) {
            case AttribType.Float:
                this.glType = WebGLRenderingContext.FLOAT
                this.bytes = attrib.size * 4
                break
            default:
                const never: never = attrib.type
                throw { "Unexpected type on attribute": attrib }
        }
    }
}

export class AttributesInfo {
    readonly size: number
    readonly stride: number
    readonly attributes: ReadonlyArray<AttribInternal>

    constructor(attributes: ReadonlyArray<Attrib>) {
        {
            let attributes_ = new Array<AttribInternal>(attributes.length)
            for (let i = 0; i < attributes.length; i++) {
                const attrib = attributes[i]
                attributes_[i] = new AttribInternal(attrib)
            }
            this.attributes = attributes_
        }
        {
            let totalSize = 0
            for (let i = 0; i < this.attributes.length; i++) {
                totalSize += this.attributes[i].size
            }
            this.size = totalSize
            this.stride = totalSize * 4
        }
    }

    bindAttribLocations(gl: WebGLRenderingContext, program: WebGLProgram): void {
        const { attributes } = this
        for (let i = 0; i < attributes.length; i++) {
            gl.bindAttribLocation(program, i, attributes[i].name)
        }
    }

    vertexAttrib(gl: WebGLRenderingContext): void {
        const { attributes } = this

        let sizeOffset = 0
        for (let i = 0; i < attributes.length; i++) {
            const attrib = attributes[i]
            gl.vertexAttribPointer(i, attrib.size, attrib.glType, false, this.stride, sizeOffset)
            sizeOffset += attrib.bytes
        }

        for (let i = 0; i < attributes.length; i++) {
            gl.enableVertexAttribArray(i)
        }
    }

    getDrawCount(offset: number): number {
        return offset / this.size
    }
}

export namespace Blend {
    export const enum Mode {
        Normal,
        Erase,
    }

    export interface Factors {
        readonly sfact: number
        readonly dfact: number
    }

    export const factorsNormal = {
        sfact: WebGLRenderingContext.ONE,
        dfact: WebGLRenderingContext.ONE_MINUS_SRC_ALPHA,
    }

    export const factorsErase = {
        sfact: WebGLRenderingContext.ZERO,
        dfact: WebGLRenderingContext.ONE_MINUS_SRC_ALPHA,
    }

    export function getFactors(mode: Mode): Factors {
        switch (mode) {
            case Mode.Normal:
                return factorsNormal
            case Mode.Erase:
                return factorsErase
        }
    }
}
