import { Renderer } from "../Renderer";
import { Texture } from "../Texture";
import { Batch } from "../Batch";
import { createProgram } from "./WebGLHelper";

export type ShaderDataTypes = 
	"b" | 
	// integers
	"i1" | "i2" | "i3" | "i4" |
	"1i" | "2i" | "3i" | "4i" |
	// floats
	"f1" | "f2" | "f3" | "f4" |
	"1f" | "2f" | "3f" | "4f" |
	// matrix
	"mat3" |
	// texcture
	"t";

export class Attribute {
	public location: number = null;

	constructor(
		public type: number,
		public size: number,

		// I want to do instancing to reduce the size of my vertex buffer, but I don't know how to do it currently.
		// It might also cause issues if certain browsers don't support it.
		public instanced = false 
	) { }

}

export class Uniform {
	public location: WebGLUniformLocation = null;
	
	constructor(
		public type: ShaderDataTypes,
		public value: any
	) { }
}


export type AttributeMap = { [s: string]: Attribute }
export type UniformMap = { [s: string]: Uniform }


export class Shader {
	protected readonly _renderer: Renderer;
	protected          _program: WebGLProgram;
	public readonly 	attributes: AttributeMap;
	public          	uniforms: UniformMap;
	public          	batch: Batch;
	public				name = "base shader";

	public constructor(
		renderer: Renderer,
		vertSrc: string,
		fragSrc: string,
		attributes: AttributeMap = {},
		uniforms: UniformMap = {},
		maxTriangles: number   // if elementsArray is set to true, then this is counted as squares instead of triangles
	) {
		console.assert(renderer != null, `Renderer is null ${renderer}`);
		console.assert(vertSrc != null, `VertSrc is ${vertSrc}`);
		console.assert(vertSrc !== "", "VertSrc is empty");
		console.assert(fragSrc != null, `FragSrc is ${fragSrc}`);
		console.assert(fragSrc !== "", "FragSrc is empty");
		console.assert(attributes != null, `Attributes is ${attributes}`);
		console.assert(uniforms != null, `Uniforms is ${uniforms}`);
		console.assert(maxTriangles != null, `MaxTriangles is ${maxTriangles}`);
		console.assert(maxTriangles > 0, `MaxTriangles is <=0 : ${maxTriangles}`);

		this._renderer = renderer;
		const program = createProgram(renderer.gl, vertSrc, fragSrc);
		this._program = program.value;
		this.attributes = attributes;
		this.uniforms = uniforms;
		this.bindAttributeLocations();
		this.cacheUniformLocations();


		this.batch = new Batch(renderer, attributes, maxTriangles);
	}


	public activate() {
		this._renderer.gl.useProgram(this._program);
	}


	public bindAttributeLocations() {
		const gl = this._renderer.gl;
		const attributes = this.attributes;
		const keys = Object.keys(attributes);
		const program = this._program;

		// bind locations sequentially starting at 0
		// this means that the sorting of the attributes will determine their locations
		// I don't yet know if their locations matter, though.
		for (let i = 0, ilen = keys.length; i < ilen; i++) {
			gl.bindAttribLocation(program, i, keys[i]);
			attributes[keys[i]].location = i;
		}
	}


	public cacheUniformLocations() {
		const gl = this._renderer.gl;
		const uniforms = this.uniforms;
		const program = this._program;
		const keys = Object.keys(uniforms);
		for (let i = 0, ilen = keys.length; i < ilen; i++) {
			uniforms[keys[i]].location = gl.getUniformLocation(program, keys[i]);
		}
	}


	public syncUniforms() {
		const gl = this._renderer.gl;
		const uniforms = this.uniforms;
		const keys = Object.keys(uniforms);

		for (let i = 0, ilen = keys.length; i < ilen; i++) {
			this._syncUniform(uniforms[keys[i]]);
		}
	}


	protected _syncUniform(uniform: Uniform) {
		const location = uniform.location;
		const value = uniform.value;
		switch (uniform.type) {
			case "b":
				this._renderer.gl.uniform1i(location, (value === true ? 1 : 0));
				break;
			case "i1":
			case "1i":
				this._renderer.gl.uniform1i(location, value);
				break;
			case "i2":
			case "2i":
				this._renderer.gl.uniform2i(location, value.x, value.y);
				break;
			case "i3":
			case "3i":
				this._renderer.gl.uniform3i(location, value.x, value.y, value.z);
				break;
			case "i4":
			case "4i":
				this._renderer.gl.uniform4i(location, value.x, value.y, value.z, value.w);
				break;
			case "f1":
			case "1f":
				this._renderer.gl.uniform1f(location, value);
				break;
			case "f2":
			case "2f":
				this._renderer.gl.uniform2f(location, value.x, value.y);
				break;
			case "f3":
			case "3f":
				this._renderer.gl.uniform3f(location, value.x, value.y, value.z);
				break;
			case "f4":
			case "4f":
				this._renderer.gl.uniform4f(location, value.x, value.y, value.z, value.w);
				break;
			case "mat3":
				this._renderer.gl.uniformMatrix3fv(location, false, value);
				break;
			case "t":
				const texture = <Texture>value;
				const idx = this._renderer.textureManager.bindTexture(texture, 0);
				this._renderer.gl.uniform1i(location, idx);
				//console.log(`setting texture ${texture.id} to index ${idx}`);
				break;
			default:
				console.error("Shader -- unknown uniform type: ", uniform.type, " -- value: ", value);
				return;
		}
	}


	protected _recompileProgram(vertSrc: string, fragSrc: string): boolean {
		const gl = this._renderer.gl;
		const newProgram = createProgram(gl, vertSrc, fragSrc);

		if (newProgram === null) {
			console.warn("Failed to recompile program.");
			return false;
		}

		gl.deleteProgram(this._program);
		this._program = newProgram.value;
		return true;
	}
}
