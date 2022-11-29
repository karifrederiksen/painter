export * from "./glsl";
export * as Blend from "./blend";
export function createProgram(gl, vSrc, fSrc) {
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
function compileShader(gl, src, shaderType) {
    const shader = gl.createShader(shaderType);
    if (shader === null) {
        console.error("Failed to create shader.");
        return null;
    }
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS))
        return shader;
    console.group("Failed to compile shader");
    console.error("shader info log: ", gl.getShaderInfoLog(shader));
    const prettySrc = withNumberedLines(src);
    console.info(prettySrc);
    console.groupEnd();
    gl.deleteShader(shader);
    return null;
}
function linkProgram(gl, program) {
    gl.linkProgram(program);
    if (program !== null || gl.getProgramParameter(program, gl.LINK_STATUS))
        return program;
    console.group("Failed to link program");
    console.error("error: ", gl.getError());
    console.info("validate status: ", gl.getProgramParameter(program, gl.VALIDATE_STATUS));
    console.info("program info log: ", gl.getProgramInfoLog(program));
    console.groupEnd();
    gl.deleteProgram(program);
    return null;
}
function withNumberedLines(src) {
    const lines = src.split("\n");
    const lineNumberLength = lines.length.toString().length;
    return lines
        .map((line, index) => padStart(index.toString(10), lineNumberLength, "0") + "| " + line)
        .join("\n");
}
function padStart(text, length, fillChar) {
    const padCount = length - text.length;
    if (padCount <= 0)
        return text;
    const pad = [];
    for (let i = 0; i < padCount; i++)
        pad.push(fillChar);
    pad.push(text);
    return pad.join("");
}
export var UniformType;
(function (UniformType) {
    UniformType[UniformType["I1"] = 0] = "I1";
    UniformType[UniformType["F1"] = 1] = "F1";
    UniformType[UniformType["F2"] = 2] = "F2";
    UniformType[UniformType["F3"] = 3] = "F3";
    UniformType[UniformType["F4"] = 4] = "F4";
})(UniformType || (UniformType = {}));
export class Uniform {
    location;
    type;
    constructor(location, type) {
        this.location = location;
        this.type = type;
    }
}
export function getUniformLocation(gl, program, uniforms) {
    const result = {};
    const notFound = [];
    for (const propName in uniforms) {
        // eslint-disable-next-line no-prototype-builtins
        if (!uniforms.hasOwnProperty(propName)) {
            continue;
        }
        const textureLoc = gl.getUniformLocation(program, propName);
        if (textureLoc === null) {
            notFound.push(propName);
        }
        else {
            result[propName] = new Uniform(textureLoc, uniforms[propName]);
        }
    }
    if (notFound.length === 0) {
        return result;
    }
    let msg = "Failed to find location for uniforms";
    for (let i = 0; i < notFound.length; i++) {
        msg += "\n - " + notFound[i];
    }
    console.error(msg);
    return null;
}
export function updateUniforms(gl, uniforms, args) {
    for (const propName in uniforms) {
        // eslint-disable-next-line no-prototype-builtins
        if (!args.hasOwnProperty(propName)) {
            continue;
        }
        const uniform = uniforms[propName];
        switch (uniform.type) {
            case UniformType.I1: {
                const arg = args[propName];
                gl.uniform1i(uniform.location, arg);
                break;
            }
            case UniformType.F1: {
                const arg = args[propName];
                gl.uniform1f(uniform.location, arg);
                break;
            }
            case UniformType.F2: {
                const arg = args[propName];
                gl.uniform2f(uniform.location, arg.x, arg.y);
                break;
            }
            case UniformType.F3: {
                const arg = args[propName];
                gl.uniform3f(uniform.location, arg.x, arg.y, arg.z);
                break;
            }
            case UniformType.F4: {
                const arg = args[propName];
                gl.uniform4f(uniform.location, arg.x, arg.y, arg.z, arg.w);
                break;
            }
            default: {
                const never = uniform.type;
                throw { "unexpected type": uniform };
            }
        }
    }
}
// Not using anything but float current, but this will allow us to easily add other types later
export var AttribType;
(function (AttribType) {
    AttribType[AttribType["Float"] = 0] = "Float";
})(AttribType || (AttribType = {}));
class AttribInternal {
    name;
    size;
    glType;
    bytes;
    constructor(gl, attrib) {
        this.name = attrib.name;
        this.size = attrib.size;
        switch (attrib.type) {
            case AttribType.Float:
                this.glType = gl.FLOAT;
                this.bytes = attrib.size * 4;
                break;
            default: {
                const never = attrib.type;
                throw { "Unexpected type on attribute": attrib };
            }
        }
    }
}
export class AttributesInfo {
    size;
    stride;
    attributes;
    constructor(gl, attributes) {
        {
            const attributes_ = new Array(attributes.length);
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
    bindAttribLocations(gl, program) {
        const { attributes } = this;
        for (let i = 0; i < attributes.length; i++) {
            gl.bindAttribLocation(program, i, attributes[i].name);
        }
    }
    vertexAttrib(gl) {
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
    getDrawCount(offset) {
        return offset / this.size;
    }
}
