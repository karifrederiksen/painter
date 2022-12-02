import * as WebGL from "../webgl/index.js";
const VERT_SRC = `
precision highp float;

attribute vec2 a_position;

uniform vec2 u_resolution;

varying vec2 v_tex_coords;

void main() {
    vec2 pos = a_position / u_resolution;
    pos.y = 1.0 - pos.y;
    v_tex_coords = pos;
    pos = pos * 2.0;
    pos = pos - 1.0;
    gl_Position = vec4(pos, 0.0, 1.0);
    
}
`;
const FRAG_SRC = `
precision highp float;

${WebGL.DEFINE_from_linear}

varying vec2 v_tex_coords;

uniform sampler2D u_texture;

void main() {
    vec4 pixel = texture2D(u_texture, v_tex_coords);
    gl_FragColor = vec4(from_linear(pixel.rgb), pixel.a);
}
`;
const getAttributesInfo = (gl) => new WebGL.AttributesInfo(gl, [{ name: "a_position", size: 2, type: WebGL.AttribType.Float }]);
const Uniforms = {
    u_resolution: WebGL.UniformType.F2,
    u_texture: WebGL.UniformType.I1,
};
export class Shader {
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
        return new Shader(gl, program, locations);
    }
    buffer;
    array;
    capacity = 1024;
    constructor(gl, program, locations) {
        this.program = program;
        this.locations = locations;
        this.buffer = gl.createBuffer();
        this.array = new Float32Array(getAttributesInfo(gl).size * 6 * this.capacity);
    }
    render(gl, args) {
        const { sfact, dfact } = WebGL.Blend.factorsNormal(gl);
        gl.blendFunc(sfact, dfact);
        gl.useProgram(this.program);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        if (this.capacity < args.blocks.length) {
            this.capacity = args.blocks.length;
            this.array = new Float32Array(getAttributesInfo(gl).size * 6 * this.capacity);
        }
        const array = this.array;
        let offset = 0;
        for (let i = 0; i < args.blocks.length; i++) {
            const { x0, y0, x1, y1 } = args.blocks[i];
            array[offset++] = x0;
            array[offset++] = y0;
            array[offset++] = x0;
            array[offset++] = y1;
            array[offset++] = x1;
            array[offset++] = y0;
            array[offset++] = x0;
            array[offset++] = y1;
            array[offset++] = x1;
            array[offset++] = y0;
            array[offset++] = x1;
            array[offset++] = y1;
        }
        // buffer data
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, array, gl.DYNAMIC_DRAW);
        WebGL.updateUniforms(gl, this.locations, args.uniforms);
        getAttributesInfo(gl).vertexAttrib(gl);
        gl.drawArrays(gl.TRIANGLES, 0, 6 * args.blocks.length);
    }
    dispose(gl) {
        gl.deleteBuffer(this.buffer);
        gl.deleteProgram(this.program);
    }
}