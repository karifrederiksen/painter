export * from "./glsl"

export function createProgram(
    gl: WebGLRenderingContext,
    vSrc: string,
    fSrc: string
): WebGLProgram | null {
    const vShader = compileShader(gl, vSrc, WebGLRenderingContext.VERTEX_SHADER)
    const fShader = compileShader(gl, fSrc, WebGLRenderingContext.FRAGMENT_SHADER)

    if (vShader === null || fShader === null) return null

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
    gl.shaderSource(shader, src)
    gl.compileShader(shader)

    if (gl.getShaderParameter(shader, WebGLRenderingContext.COMPILE_STATUS)) return shader

    console.group("Shader compilation")
    console.error("failed to compile shader")
    console.log("shader info log: ", gl.getShaderInfoLog(shader))
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

    console.group("Program linking")
    console.error("failed to link program")
    console.log(
        "validate status: ",
        gl.getProgramParameter(program, WebGLRenderingContext.VALIDATE_STATUS)
    )
    console.log("error: ", gl.getError())
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

export function getUniformLocation(
    gl: WebGLRenderingContext,
    program: WebGLProgram,
    name: string
): WebGLUniformLocation | null {
    const textureLoc = gl.getUniformLocation(program, name)
    if (textureLoc !== null) return textureLoc

    console.error(`Failed to find location for uniform "${name}"`)
    return null
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
