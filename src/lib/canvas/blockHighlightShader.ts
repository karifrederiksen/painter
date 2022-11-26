import * as WebGL from "../webgl";
import type { HighlightBlock } from "./renderBlockSystem";

const VERT_SRC = `
precision highp float;

attribute vec2 a_position;
attribute float a_opacity;

uniform vec2 u_resolution;

varying float v_opacity;

void main() {
    vec2 pos = a_position / u_resolution;
    pos.y = 1.0 - pos.y;
    pos = pos * 2.0;
    pos = pos - 1.0;
    gl_Position = vec4(pos, 0.0, 1.0);

    v_opacity = a_opacity;
}
`;

const FRAG_SRC = `
precision highp float;

varying float v_opacity;

uniform vec4 u_rgba;

void main() {
    gl_FragColor = u_rgba * v_opacity;
}
`;

const getAttributesInfo = (gl: WebGLRenderingContext) =>
  new WebGL.AttributesInfo(gl, [
    { name: "a_position", size: 2, type: WebGL.AttribType.Float },
    { name: "a_opacity", size: 1, type: WebGL.AttribType.Float },
  ]);

const Uniforms = {
  u_resolution: WebGL.UniformType.F2,
  u_rgba: WebGL.UniformType.F4,
} as const;

export interface Args {
  readonly uniforms: WebGL.UniformArgs<typeof Uniforms>;
  readonly framebuffer: WebGLFramebuffer;
  readonly blockHighlights: readonly HighlightBlock[];
}

export class Shader {
  static attributesInfo: WebGL.AttributesInfo;
  static create(gl: WebGLRenderingContext): Shader | null {
    const program = WebGL.createProgram(gl, VERT_SRC, FRAG_SRC);
    if (program === null) {
      return null;
    }

    const locations = WebGL.getUniformLocation(gl, program, Uniforms);
    if (locations === null) {
      return null;
    }

    this.attributesInfo = getAttributesInfo(gl);
    this.attributesInfo.bindAttribLocations(gl, program);

    return new Shader(gl, program, locations);
  }

  private readonly buffer: WebGLBuffer;
  private array: Float32Array;
  private capacity = 1024;

  private constructor(
    gl: WebGLRenderingContext,
    private readonly program: WebGLProgram,
    private readonly locations: WebGL.UniformsInfo<typeof Uniforms>,
  ) {
    this.buffer = gl.createBuffer() as WebGLBuffer;
    this.array = new Float32Array(Shader.attributesInfo.size * 6 * this.capacity);
  }

  render(gl: WebGLRenderingContext, args: Args): void {
    if (args.framebuffer == null) {
      throw new Error("Framebuffer should be defined");
    }
    const { sfact, dfact } = WebGL.Blend.factorsNormal(gl);
    gl.blendFunc(sfact, dfact);
    gl.useProgram(this.program);
    gl.bindFramebuffer(gl.FRAMEBUFFER, args.framebuffer);
    if (this.capacity < args.blockHighlights.length) {
      this.capacity = args.blockHighlights.length;
      this.array = new Float32Array(Shader.attributesInfo.size * 6 * this.capacity);
    }

    const array = this.array;

    let offset = 0;
    for (let i = 0; i < args.blockHighlights.length; i++) {
      const { block, opacity } = args.blockHighlights[i];
      const { x0, y0, x1, y1 } = block;

      array[offset++] = x0;
      array[offset++] = y0;
      array[offset++] = opacity;
      array[offset++] = x0;
      array[offset++] = y1;
      array[offset++] = opacity;
      array[offset++] = x1;
      array[offset++] = y0;
      array[offset++] = opacity;

      array[offset++] = x0;
      array[offset++] = y1;
      array[offset++] = opacity;
      array[offset++] = x1;
      array[offset++] = y0;
      array[offset++] = opacity;
      array[offset++] = x1;
      array[offset++] = y1;
      array[offset++] = opacity;
    }

    // buffer data
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, array, gl.DYNAMIC_DRAW);

    WebGL.updateUniforms(gl, this.locations, args.uniforms);

    Shader.attributesInfo.vertexAttrib(gl);

    gl.drawArrays(gl.TRIANGLES, 0, 6 * args.blockHighlights.length);
  }

  dispose(gl: WebGLRenderingContext): void {
    gl.deleteBuffer(this.buffer);
    gl.deleteProgram(this.program);
  }
}
