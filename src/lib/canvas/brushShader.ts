import type * as Color from "color";
import * as WebGL from "../webgl/index.js";
import { Vec2, Vec4 } from "../util/index.js";

const INITIAL_VARRAY_SIZE = 5000;

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

    v_color = vec4(a_color.rgb * a_color.a, a_color.a);
    v_tex_coords = a_tex_coords;
}
`;

const FRAG_SRC = `
precision highp float;

varying vec4 v_color;
varying vec2 v_tex_coords;

uniform sampler2D u_texture;

void main() {
    float alpha = texture2D(u_texture, v_tex_coords).a;
    gl_FragColor = v_color * alpha;
}
`;

// TODO: Use elements array!

export interface BrushPoint {
    readonly color: Color.RgbLinear;
    readonly alpha: number;
    readonly position: Vec2;
    readonly scaledDiameter: number;
    readonly rotation: number;
}

const getAttributesInfo = (gl: WebGLRenderingContext) =>
    new WebGL.AttributesInfo(gl, [
        { name: "a_color", size: 4, type: WebGL.AttribType.Float },
        { name: "a_tex_coords", size: 2, type: WebGL.AttribType.Float },
        { name: "a_position", size: 2, type: WebGL.AttribType.Float },
    ]);

const Uniforms = {
    u_resolution: WebGL.UniformType.F2,
    u_texture: WebGL.UniformType.I1,
} as const;

export interface Args {
    readonly uniforms: WebGL.UniformArgs<typeof Uniforms>;
    readonly blendMode: WebGL.Blend.Mode;
}

interface AffectedArea {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
}

function initAffectedArea(): AffectedArea {
    return {
        x0: Number.MAX_VALUE,
        y0: Number.MAX_VALUE,
        x1: Number.MIN_VALUE,
        y1: Number.MIN_VALUE,
    };
}

export class Shader {
    static create(gl: WebGLRenderingContext): Shader | null {
        const program = WebGL.createProgram(gl, VERT_SRC, FRAG_SRC);
        if (program === null) {
            return null;
        }

        const locations = WebGL.getUniformLocation(gl, program, Uniforms);
        if (locations === null) {
            return null;
        }

        getAttributesInfo(gl).bindAttribLocations(gl, program);

        return new Shader(gl, program, locations);
    }

    private readonly buffer: WebGLBuffer;
    private array: Float32Array;
    private offset: number;
    private affectedArea: AffectedArea;

    private constructor(
        private gl: WebGLRenderingContext,
        readonly program: WebGLProgram,
        private readonly locations: WebGL.UniformsInfo<typeof Uniforms>,
    ) {
        const arrayLength = getAttributesInfo(gl).size * 6 * INITIAL_VARRAY_SIZE;

        this.buffer = gl.createBuffer()!;
        this.array = new Float32Array(arrayLength);
        this.offset = 0;
        this.affectedArea = initAffectedArea();
    }

    get canFlush(): boolean {
        return this.offset > 0;
    }

    addPoints(points: readonly BrushPoint[]): void {
        const nextOffset = 6 * getAttributesInfo(this.gl).size * points.length + this.offset;
        while (nextOffset > this.array.length) {
            this.array = doubleSize(this.array);
        }

        const arr = this.array;
        const ptsLen = points.length;
        let offset = this.offset;
        for (let i = 0; i < ptsLen; i++) {
            offset = addPoint(arr, offset, points[i], this.affectedArea);
        }

        this.offset = offset;
    }

    getAffectedArea(): Vec4 {
        const { affectedArea } = this;
        return new Vec4(affectedArea.x0, affectedArea.y0, affectedArea.x1, affectedArea.y1);
    }

    flush(gl: WebGLRenderingContext, args: Args): void {
        gl.useProgram(this.program);

        const arrayView = this.array.subarray(0, this.offset);

        const { sfact, dfact } = WebGL.Blend.getFactors(gl, args.blendMode);
        gl.blendFunc(sfact, dfact);

        // buffer data
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, arrayView, gl.DYNAMIC_DRAW);

        WebGL.updateUniforms(gl, this.locations, args.uniforms);

        const attrInfo = getAttributesInfo(gl);
        attrInfo.vertexAttrib(gl);

        const drawCount = attrInfo.getDrawCount(this.offset);

        gl.drawArrays(gl.TRIANGLES, 0, drawCount);
        this.offset = 0;
        this.affectedArea = initAffectedArea();
    }

    dispose(gl: WebGLRenderingContext): void {
        gl.deleteBuffer(this.buffer);
        gl.deleteProgram(this.program);
    }
}

function doubleSize(arr: Float32Array): Float32Array {
    const newArr = new Float32Array(arr.length * 2);

    for (let i = 0; i < arr.length; i++) {
        newArr[i] = arr[i];
    }

    return newArr;
}

function addPoint(
    arr: Float32Array,
    offset: number,
    point: BrushPoint,
    affectedArea: AffectedArea,
): number {
    // console.log("addPoint", point.color.r, point.color.g, point.color.b)
    const x = point.position.x;
    const y = point.position.y;
    const r = point.scaledDiameter * 0.5;

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
    const x0 = x - r;
    const y0 = y - r;
    const x1 = x + r;
    const y1 = y + r;

    // first tri
    offset = addCorner(arr, offset, point, 0, 0, x0, y0);
    offset = addCorner(arr, offset, point, 1, 0, x1, y0);
    offset = addCorner(arr, offset, point, 0, 1, x0, y1);

    // second tri
    offset = addCorner(arr, offset, point, 1, 1, x1, y1);
    offset = addCorner(arr, offset, point, 0, 1, x0, y1);
    offset = addCorner(arr, offset, point, 1, 0, x1, y0);

    // investigate performance: use ternaries that always assign instead of conditional assignment
    // idk, might worth looking into
    if (x0 < affectedArea.x0) {
        affectedArea.x0 = x0;
    }
    if (y0 < affectedArea.y0) {
        affectedArea.y0 = y0;
    }
    if (x1 > affectedArea.x1) {
        affectedArea.x1 = x1;
    }
    if (y1 > affectedArea.y1) {
        affectedArea.y1 = y1;
    }

    return offset;
}

function addCorner(
    arr: Float32Array,
    offset: number,
    point: BrushPoint,
    tx: number,
    ty: number,
    x: number,
    y: number,
): number {
    // vec4 a_color
    arr[offset++] = point.color.r;
    arr[offset++] = point.color.g;
    arr[offset++] = point.color.b;
    arr[offset++] = point.alpha;

    // vec2 a_tex_coords
    arr[offset++] = tx;
    arr[offset++] = ty;

    // vec2 a_position
    arr[offset++] = x;
    arr[offset++] = y;

    return offset;
}
