export const DEFINE_TAU = `#ifndef TAU
    #define TAU 6.283185307179586
#endif`

// credit: http://lolengine.net/blog/2013/07/27/rgb-to-hsv-in-glsl - Sam Hocevar
export const DEFINE_hsv2rgb = `vec3 hsv2rgb(in vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}`

// credit: https://www.shadertoy.com/view/MsS3Wc - Iñigo Quiles
// export const DEFINE_hsv2rgb = `vec3 hsv2rgb(in vec3 c) {
//     vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
//     rgb = rgb * rgb * (3.0 - 2.0 * rgb);
//     return c.z * mix(vec3(1.0), rgb, c.y);
// }`

export const DEFINE_from_linear = `
vec3 from_linear(in vec3 color) {
    return pow(color, vec3(1.0 / 2.2)); 
}
`

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
