import * as Color from "color";
import { DEFINE_TAU, createProgram, DEFINE_hsluv_etc, DEFINE_hsvToRgb } from "../../../webgl";
import { ColorMode, CanvasPool } from "../../../util";
export class GlState {
    canvas;
    gl;
    ringRenderer;
    satValRenderer;
    constructor(canvas) {
        this.canvas = canvas;
        const gl = canvas.getContext("webgl");
        if (gl === null) {
            throw new Error("Failed to init webgl");
        }
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND);
        gl.disable(gl.DEPTH_TEST);
        this.gl = gl;
        this.ringRenderer = new RingRenderer(gl);
        this.satValRenderer = new SatValRenderer(gl);
    }
    render(colorMode, color) {
        this.gl.clearColor(0, 0, 0, 0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.ringRenderer.render(colorMode, color);
        this.satValRenderer.render(colorMode, color);
    }
    getThumbPositions(colorType, color) {
        const canvasRect = this.canvas.getBoundingClientRect();
        let angle;
        let xPct;
        let yPct;
        if (colorType === ColorMode.Hsluv) {
            angle = (color.h + 180) % 360;
            xPct = color.s / 100;
            yPct = color.l / 100;
        }
        else {
            const hsv = Color.rgbToHsv(color.toRgb());
            angle = (hsv.h * 360 + 180) % 360;
            xPct = hsv.s;
            yPct = hsv.v;
        }
        let circleThumbX = 0;
        let circleThumbY = 0;
        if (canvasRect !== null) {
            const radius = 80;
            const cx = canvasRect.left + radius;
            const cy = canvasRect.top + radius;
            const theta = (angle * Math.PI) / 180;
            const dx = (radius - 8) * Math.cos(theta);
            const dy = (radius - 8) * Math.sin(theta);
            circleThumbX = cx + dx;
            circleThumbY = cy + dy;
        }
        let areaThumbX = 0;
        let areaThumbY = 0;
        if (canvasRect !== null) {
            const offset = canvasRect.width * 0.225;
            const width = canvasRect.width * 0.55;
            areaThumbX = canvasRect.left + offset + width * xPct;
            areaThumbY = canvasRect.top + offset + width * (1 - yPct);
        }
        return {
            angle,
            circleThumbX,
            circleThumbY,
            areaThumbX,
            areaThumbY,
        };
    }
    dispose() {
        this.ringRenderer.dispose();
        this.satValRenderer.dispose();
        CanvasPool.recycle(this.canvas);
    }
}
const RING_VERT_SRC = `
precision highp float;

attribute vec2 a_position;

varying vec2 v_position;

void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);

    v_position = a_position;
}
`;
function makeRingFragSrc(DEFINE_toRgb) {
    return `
    precision highp float;
    
    ${DEFINE_TAU}

    ${DEFINE_toRgb}
    
    #define INNER_RAD1 0.83
    #define INNER_RAD2 0.85
    #define OUTER_RAD1 0.98
    #define OUTER_RAD2 1.00
    
    varying vec2 v_position;
    
    uniform vec3 u_color;
    
    void main() {
        vec2 pos = v_position * vec2(1.0, -1.0);
        float dist = sqrt(dot(pos, pos));
    
        float a = smoothstep(INNER_RAD1, INNER_RAD2, dist) - smoothstep(OUTER_RAD1, OUTER_RAD2, dist);
    
        float radians = atan(pos.y, pos.x);
        float hue = (radians / TAU) + 0.5;
    
        vec3 hsluv = vec3(hue, 1.0, a);
    
        gl_FragColor = vec4(toRgb(u_color, hsluv) * a, a);
    }
    `;
}
const RING_FRAG_SRC_HSV = makeRingFragSrc(`
${DEFINE_hsvToRgb}

vec3 toRgb(vec3 color, vec3 xyz) {
    return hsvToRgb(xyz * vec3(1.0, color.y, color.z));
}
`);
const RING_FRAG_SRC_HSLUV = makeRingFragSrc(`
${DEFINE_hsluv_etc}

vec3 toRgb(vec3 color, vec3 xyz) {
    return hsluvToRgb(xyz * vec3(360.0, color.y, color.z));
}
`);
class RingRenderer {
    gl;
    buffer;
    program = null;
    colorLocation = null;
    prevColorType = null;
    constructor(gl) {
        this.gl = gl;
        this.buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0]), gl.STATIC_DRAW);
    }
    render(colorType, color) {
        if (!this.program || this.prevColorType !== colorType) {
            if (this.program) {
                this.gl.deleteProgram(this.program);
            }
            switch (colorType) {
                case ColorMode.Hsv:
                    this.program = createProgram(this.gl, RING_VERT_SRC, RING_FRAG_SRC_HSV);
                    break;
                case ColorMode.Hsluv:
                    this.program = createProgram(this.gl, RING_VERT_SRC, RING_FRAG_SRC_HSLUV);
                    break;
            }
            this.gl.bindAttribLocation(this.program, 0, "a_position");
            this.colorLocation = this.gl.getUniformLocation(this.program, "u_color");
            this.prevColorType = colorType;
        }
        this.gl.useProgram(this.program);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
        this.gl.vertexAttribPointer(0, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(0);
        switch (colorType) {
            case ColorMode.Hsv: {
                const hsv = Color.rgbToHsv(Color.hsluvToRgb(color));
                this.gl.uniform3f(this.colorLocation, hsv.h, hsv.s, hsv.v);
                break;
            }
            case ColorMode.Hsluv: {
                this.gl.uniform3f(this.colorLocation, color.h, color.s, color.l);
                break;
            }
        }
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    }
    dispose() {
        this.gl.deleteBuffer(this.buffer);
        this.gl.deleteProgram(this.program);
    }
}
const WI = 0.55;
const SATVAL_VERT_SRC = `
precision highp float;

attribute vec2 a_position;

varying vec2 v_tex_position;

void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);

    v_tex_position = ((a_position / ${WI.toFixed(2)}) + 1.0) / 2.0;
}
`;
function makeSatValFragSrc(DEFINE_toRgb) {
    return `
    precision highp float;

    ${DEFINE_toRgb}
    
    varying vec2 v_tex_position;
    
    uniform vec3 u_color;
    
    void main() {
        // mix saturation from left to right [0, 1]
        // mix value from bottom to top: [0, 1]
        float x = v_tex_position.x;
        float y = v_tex_position.y;
    
        gl_FragColor = vec4(
            toRgb(u_color.x, x, y),
            1.0
        );
    }
    `;
}
const SATVAL_FRAG_SRC_HSV = makeSatValFragSrc(`
${DEFINE_hsvToRgb}

vec3 toRgb(float hue, float x, float y) {
    return hsvToRgb(vec3(hue, x, y));
}
`);
const SATVAL_FRAG_SRC_HSLUV = makeSatValFragSrc(`
${DEFINE_hsluv_etc}

vec3 toRgb(float hue, float x, float y) {
    return hsluvToRgb(vec3(hue, x * 100.0, y * 100.0));
}
`);
class SatValRenderer {
    gl;
    buffer;
    colorLocation = null;
    program = null;
    prevColorMode = null;
    constructor(gl) {
        this.gl = gl;
        this.buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            // 1
            WI,
            WI,
            // 2
            -WI,
            WI,
            // 3
            WI,
            -WI,
            // 4
            -WI,
            WI,
            // 5
            WI,
            -WI,
            // 6
            -WI,
            -WI,
        ]), gl.STATIC_DRAW);
    }
    render(colorMode, color) {
        const gl = this.gl;
        if (!this.program || this.prevColorMode !== colorMode) {
            if (this.program) {
                gl.deleteProgram(this.program);
            }
            switch (colorMode) {
                case ColorMode.Hsv:
                    this.program = createProgram(gl, SATVAL_VERT_SRC, SATVAL_FRAG_SRC_HSV);
                    break;
                case ColorMode.Hsluv:
                    this.program = createProgram(gl, SATVAL_VERT_SRC, SATVAL_FRAG_SRC_HSLUV);
                    break;
                default: {
                    const never = colorMode;
                    throw { "unexpected color mode": colorMode };
                }
            }
            gl.bindAttribLocation(this.program, 0, "a_position");
            this.colorLocation = gl.getUniformLocation(this.program, "u_color");
        }
        gl.useProgram(this.program);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(0);
        switch (colorMode) {
            case ColorMode.Hsv: {
                const hsv = Color.rgbToHsv(Color.hsluvToRgb(color));
                this.gl.uniform3f(this.colorLocation, hsv.h, hsv.s, hsv.v);
                break;
            }
            case ColorMode.Hsluv: {
                this.gl.uniform3f(this.colorLocation, color.h, color.s, color.l);
                break;
            }
        }
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        this.prevColorMode = colorMode;
    }
    dispose() {
        const gl = this.gl;
        gl.deleteBuffer(this.buffer);
        gl.deleteProgram(this.program);
    }
}
