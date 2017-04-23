
import { Option, MatchPattern, ArrayMatchPattern } from "../../Common";

export function createProgram(gl: WebGLRenderingContext, vertSrc: string, fragSrc: string): Option<WebGLProgram> {
	const vShader = _compileShader(gl, vertSrc, WebGLRenderingContext.VERTEX_SHADER);
	const fShader = _compileShader(gl, fragSrc, WebGLRenderingContext.FRAGMENT_SHADER);
	
	
	if (Option.areSome([ vShader, fShader ])) {
		return _compileProgram(gl, vShader.value, fShader.value);
	}
	return Option.none();
}

export function _compileProgram(gl: WebGLRenderingContext, vert: WebGLShader, frag: WebGLShader): Option<WebGLProgram> {
	const program = gl.createProgram();
	
	gl.attachShader(program, vert);
	gl.attachShader(program, frag);

	gl.linkProgram(program);

	gl.deleteShader(vert);
	gl.deleteShader(frag);

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		// Log failure information to the console
		console.error("Failed to link program");
		console.warn("Validate status: ", gl.getProgramParameter(program, gl.VALIDATE_STATUS));
		console.warn("Error: ", gl.getError());
		console.warn("ProgramInfoLog: ", gl.getProgramInfoLog(program));

		// delete before returning
		gl.deleteProgram(program);
		return Option.none();
	}
	return Option.some(program);
}


export function _compileShader(gl: WebGLRenderingContext, src: string, type: number): Option<WebGLShader> {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, src);
	gl.compileShader(shader);

	if (gl.getShaderParameter(shader, gl.COMPILE_STATUS) === false) {
		console.error("Failed to compile shader");
		console.warn("ShaderInfoLog: ", gl.getShaderInfoLog(shader));
		console.log(src)
		gl.deleteShader(shader);
		return Option.none();
	}
	return Option.some(shader);
}