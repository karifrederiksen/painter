import { createProgram, getUniformLocation } from "canvas/web-gl"
import { Renderer } from "./renderer"
import { RgbLinear } from "canvas/color"
import { Vec2 } from "canvas/util"

const INITIAL_VARRAY_SIZE = 5000

const floatsPerVertex = 8
const batchStride = floatsPerVertex * 4

const VERT_SRC = `
precision highp float;

attribute vec4 a_color;
attribute vec2 a_tex_coords;
attribute vec2 a_position;

uniform vec2 u_resolution;

varying vec4 v_color;
varying vec2 v_tex_coords;

void main() {
    vec2 pos = (a_position / u_resolution) * vec2(2.0, -2.0) + vec2(-1.0, 1.0);
    gl_Position = vec4(pos, 0.0, 1.0);

    v_color = a_color;
    v_tex_coords = a_tex_coords;
}
`

const FRAG_SRC = `
precision highp float;

varying vec4 v_color;
varying vec2 v_tex_coords;

uniform sampler2D u_texture;

void main() {
    float alpha = texture2D(u_texture, v_tex_coords).a;
    gl_FragColor = v_color * alpha;
}
`

// TODO: Use elements array!

export class BrushShader {
    static create(gl: WebGLRenderingContext): BrushShader | null {
        const program = createProgram(gl, VERT_SRC, FRAG_SRC)
        if (program === null) return null

        gl.bindAttribLocation(program, 0, "a_color")
        gl.bindAttribLocation(program, 1, "a_tex_coords")
        gl.bindAttribLocation(program, 2, "a_position")

        const textureUniform = getUniformLocation(gl, program, "u_texture")
        if (textureUniform === null) return null

        const resolutionUniform = getUniformLocation(gl, program, "u_resolution")
        if (resolutionUniform === null) return null

        return new BrushShader(gl, program, textureUniform, resolutionUniform)
    }

    private readonly buffer: WebGLBuffer
    private array: Float32Array
    private offset: number

    private constructor(
        gl: WebGLRenderingContext,
        readonly program: WebGLProgram,
        private readonly textureUniform: WebGLUniformLocation,
        private readonly resolutionUniform: WebGLUniformLocation
    ) {
        const arrayLength = floatsPerVertex * 6 * INITIAL_VARRAY_SIZE

        this.buffer = gl.createBuffer()!
        this.array = new Float32Array(arrayLength)
        this.offset = 0
    }

    get canFlush(): boolean {
        return this.offset > 0
    }

    addPoints(points: ReadonlyArray<BrushPoint>): void {
        const nextOffset = 6 * floatsPerVertex * points.length + this.offset
        while (nextOffset > this.array.length) {
            this.array = doubleSize(this.array)
        }

        const arr = this.array
        const ptsLen = points.length
        let offset = this.offset
        for (let i = 0; i < ptsLen; i++) offset = addPoint(arr, offset, points[i])

        this.offset = offset
    }

    flush(renderer: Renderer, uniforms: BrushUniforms): void {
        renderer.setProgram(this.program)
        const gl = renderer.gl

        const arrayView = this.array.subarray(0, this.offset)

        // buffer data
        gl.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, this.buffer)
        gl.bufferData(
            WebGLRenderingContext.ARRAY_BUFFER,
            arrayView,
            WebGLRenderingContext.DYNAMIC_DRAW
        )

        // update uniforms
        gl.uniform1i(this.textureUniform, uniforms.textureIndex)
        gl.uniform2f(this.resolutionUniform, uniforms.resolution.x, uniforms.resolution.y)

        // enable attributes
        gl.vertexAttribPointer(0, 4, WebGLRenderingContext.FLOAT, false, batchStride, 0)
        gl.vertexAttribPointer(1, 2, WebGLRenderingContext.FLOAT, false, batchStride, 16)
        gl.vertexAttribPointer(2, 2, WebGLRenderingContext.FLOAT, false, batchStride, 24)

        gl.enableVertexAttribArray(0)
        gl.enableVertexAttribArray(1)
        gl.enableVertexAttribArray(2)

        const drawCount = this.offset / floatsPerVertex
        //console.log("brushShader draw count", drawCount)

        gl.drawArrays(WebGLRenderingContext.TRIANGLES, 0, drawCount)
        this.offset = 0
    }

    dispose(gl: WebGLRenderingContext): void {
        gl.deleteBuffer(this.buffer)
        gl.deleteProgram(this.program)
    }
}

function doubleSize(arr: Float32Array): Float32Array {
    const newArr = new Float32Array(arr.length * 2)

    for (let i = 0; i < arr.length; i++) newArr[i] = arr[i]

    return newArr
}

function addPoint(arr: Float32Array, offset: number, point: BrushPoint): number {
    // console.log("addPoint", point.color.r, point.color.g, point.color.b)
    const x = point.position.x
    const y = point.position.y
    const r = point.scaledDiameter * 0.5

    // const c = Math.cos(point.rotation)
    // const s = Math.sin(point.rotation)

    // const rc = r * c
    // const rs = r * s

    // const rx = rc - rs
    // const ry = rs + rc

    // const x0 = x - rc + rs
    // const y0 = y - rs - rc
    // const x1 = x + rc - rs
    // const y1 = y + rs + rc
    const x0 = x - r
    const y0 = y - r
    const x1 = x + r
    const y1 = y + r

    // first tri
    offset = addCorner(arr, offset, point, 0, 0, x0, y0)
    offset = addCorner(arr, offset, point, 1, 0, x1, y0)
    offset = addCorner(arr, offset, point, 0, 1, x0, y1)

    // second tri
    offset = addCorner(arr, offset, point, 1, 1, x1, y1)
    offset = addCorner(arr, offset, point, 0, 1, x0, y1)
    offset = addCorner(arr, offset, point, 1, 0, x1, y0)

    return offset
}

function addCorner(
    arr: Float32Array,
    offset: number,
    point: BrushPoint,
    tx: number,
    ty: number,
    x: number,
    y: number
): number {
    // vec4 a_color
    arr[offset++] = point.color.r
    arr[offset++] = point.color.g
    arr[offset++] = point.color.b
    arr[offset++] = point.alpha

    // vec2 a_tex_coords
    arr[offset++] = tx
    arr[offset++] = ty

    // vec2 a_position
    arr[offset++] = x
    arr[offset++] = y

    return offset
}

export interface BrushPoint {
    readonly color: RgbLinear
    readonly alpha: number
    readonly position: Readonly<Vec2>
    readonly scaledDiameter: number
    readonly rotation: number
}

export interface BrushUniforms {
    readonly resolution: Readonly<Vec2>
    readonly textureIndex: number
}
