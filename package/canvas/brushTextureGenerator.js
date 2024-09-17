import * as WebGL from "../webgl/index.js";
const VERT_SRC = `
precision highp float;

attribute vec2 a_position;

varying vec2 v_position;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  
  v_position = a_position;
}
`;
const FRAG_SRC = `
precision highp float;

varying vec2 v_position;

uniform float u_softness;

void main() {
  float radius = 1.0 - u_softness;
  float dist = sqrt(dot(v_position, v_position));
  float a = 1.0 - smoothstep(radius, radius + u_softness, dist);

  gl_FragColor = vec4(vec3(0.0), (a));
}
`;
const getAttributesInfo = (gl) => new WebGL.AttributesInfo(gl, [{ name: "a_position", size: 2, type: WebGL.AttribType.Float }]);
const Uniforms = {
    u_softness: WebGL.UniformType.F1,
};
export class Generator {
    program;
    locations;
    static create(gl) {
        const program = WebGL.createProgram(gl, VERT_SRC, FRAG_SRC);
        if (program === null) {
            return null;
        }
        const locations = WebGL.getUniformLocation(gl, program, Uniforms);
        if (locations === null) {
            return null;
        }
        getAttributesInfo(gl).bindAttribLocations(gl, program);
        return new Generator(gl, program, locations);
    }
    buffer;
    array;
    constructor(gl, program, locations) {
        this.program = program;
        this.locations = locations;
        this.buffer = gl.createBuffer();
        const array = new Float32Array(12);
        array[0] = -1;
        array[1] = -1;
        array[2] = -1;
        array[3] = 1;
        array[4] = 1;
        array[5] = -1;
        array[6] = -1;
        array[7] = 1;
        array[8] = 1;
        array[9] = -1;
        array[10] = 1;
        array[11] = 1;
        this.array = array;
    }
    generateBrushTexture(gl, args) {
        const { sfact, dfact } = WebGL.Blend.factorsNormal(gl);
        gl.blendFunc(sfact, dfact);
        gl.useProgram(this.program);
        gl.viewport(0, 0, args.size.x, args.size.y);
        gl.bindFramebuffer(gl.FRAMEBUFFER, args.framebuffer);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        WebGL.updateUniforms(gl, this.locations, args.uniforms);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.array, gl.STATIC_DRAW);
        getAttributesInfo(gl).vertexAttrib(gl);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    dispose(gl) {
        gl.deleteBuffer(this.buffer);
        gl.deleteProgram(this.program);
    }
}
