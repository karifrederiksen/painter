import { Renderer } from "../Renderer";
import { Texture } from "../Texture";
import { Batch } from "../Batch";
import { createProgram } from "./WebGLHelper";
import { Vec2, Vec3, Vec4 } from "../../Math/Vec";
import { Rgb, Rgba, Hsv, Hsva } from "../../Math/Color";

export interface ShaderDataTypeMap {
	"b": boolean;

	// integer
	"1i": number;
	"2i": Vec2;
	"3i": Vec3;
	"4i": Vec4;

	// floats
	"1f": number;
	"2f": Vec2;
	"3f": Vec3;
	"4f": Vec4;
	
	// color
	"rgb": Rgb;
	"rgba": Rgba;
	"hsv": Hsv;
	"hsva": Hsva;

	// texture
	"t": Texture;
}

export type ShaderDataType = keyof ShaderDataTypeMap;
	
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

export class Uniform<T extends ShaderDataType> {
	public location: WebGLUniformLocation = null;
	
	constructor(
		public type: T,
		public value: ShaderDataTypeMap[T]
	) { }
}


export type AttributeMap = { [s: string]: Attribute };
export type UniformMap = { [s: string]: Uniform<ShaderDataType> };
export type Shader = ShaderBase<AttributeMap, UniformMap>;

export class ShaderBase<AMap extends AttributeMap, UMap extends UniformMap> {
	protected readonly _renderer: Renderer;
	protected          _program: WebGLProgram;
	public readonly 	attributes: AMap;
	public          	uniforms: UMap;
	public          	batch: Batch;
	public				name = "base shader";

	public constructor(
		renderer: Renderer,
		vertSrc: string,
		fragSrc: string,
		attributes: AMap,
		uniforms: UMap,
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
		for (let key of keys) {
			uniforms[key].location = gl.getUniformLocation(program, key);
		}
	}


	public syncUniforms() {
		const gl = this._renderer.gl;
		const uniforms = this.uniforms;
		const keys = Object.keys(uniforms);
		for (let key of keys) {
			this._syncUniform(uniforms[key]);
		}
	}


	protected _syncUniform(uniform: Uniform<ShaderDataType>) {
		const location = uniform.location;
		const value = uniform.value;
		switch (uniform.type) {
			case "b":
				this._renderer.gl.uniform1i(location, (value === true ? 1 : 0));
				break;
			case "1i":
				this._renderer.gl.uniform1i(location, <number>value);
				break;
			case "2i":
				this._renderer.gl.uniform2i(location, (<Vec2>value).x, (<Vec2>value).y);
				break;
			case "3i":
				this._renderer.gl.uniform3i(location, (<Vec3>value).x, (<Vec3>value).y, (<Vec3>value).z);
				break;
			case "4i":
				this._renderer.gl.uniform4i(location, (<Vec4>value).x, (<Vec4>value).y, (<Vec4>value).z, (<Vec4>value).w);
				break;
			case "1f":
				this._renderer.gl.uniform1f(location, <number>value);
				break;
			case "2f":
				this._renderer.gl.uniform2f(location, (<Vec2>value).x, (<Vec2>value).y);
				break;
			case "3f":
				this._renderer.gl.uniform3f(location, (<Vec3>value).x, (<Vec3>value).y, (<Vec3>value).z);
				break;
			case "4f":
				this._renderer.gl.uniform4f(location, (<Vec4>value).x, (<Vec4>value).y, (<Vec4>value).z, (<Vec4>value).w);
				break;
			case "rgb":
				this._renderer.gl.uniform3f(location, (<Rgb>value).r, (<Rgb>value).g, (<Rgb>value).b);
				break;
			case "rgba":
				this._renderer.gl.uniform4f(location, (<Rgba>value).r, (<Rgba>value).g, (<Rgba>value).b, (<Rgba>value).a);
				break;
			case "hsv":
				this._renderer.gl.uniform3f(location, (<Hsv>value).h, (<Hsv>value).s, (<Hsv>value).v);
				break;
			case "hsva":
				this._renderer.gl.uniform4f(location, (<Hsva>value).h, (<Hsva>value).s, (<Hsva>value).v, (<Hsva>value).a);
				break;
			case "t":
				const idx = this._renderer.textureManager.bindTexture(<Texture>value, 0);
				this._renderer.gl.uniform1i(location, idx);
				//console.log(`setting texture ${(<Texture>value).id} to index ${idx}`);
				break;
			default:
				console.error(`Shader -- unknown uniform type: ${uniform.type} -- value: ${value}`);
				return;
		}
	}


	protected _recompileProgram(vertSrc: string, fragSrc: string): boolean {
		const gl = this._renderer.gl;
		const newProgram = createProgram(gl, vertSrc, fragSrc);

		if (newProgram.isNone) {
			console.warn("Failed to recompile program.");
			return false;
		}

		gl.deleteProgram(this._program);
		this._program = newProgram.value;
		return true;
	}
}
