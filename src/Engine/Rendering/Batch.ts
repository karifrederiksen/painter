
import { Renderer } from "./Renderer";
import { AttributeMap, Attribute } from "./Shaders/Shader";

/*
	Batching objects.

	Attributes are declared in the Attributes object passed to the constructor.
	Attributes need to be buffered by an outside function.
	After adding attributes, remember to set the new offset correctly.
*/
export class Batch {
	public readonly BATCH_FLOATS_PER_INDEX: number;
	public readonly BATCH_STRIDE: number;
	public readonly MAX_VERTICES: number;

	public readonly array: Float32Array;
	public          arrayOffset = 0;

	protected readonly _renderer: Renderer;
	protected readonly _attributes: AttributeMap;
	protected readonly _vertexBuffer: WebGLBuffer;


	constructor(renderer: Renderer, attributes: AttributeMap, maxTriangles: number) {
		console.assert(renderer != null, `Renderer is ${renderer}`);
		console.assert(attributes != null, `Attributes is ${attributes}`);
		console.assert(maxTriangles != null, `MaxTriangles is ${maxTriangles}`);
		console.assert(maxTriangles > 0, `MaxTriangles less than or equal to 0: ${maxTriangles}`);
		this._renderer = renderer;
		const gl = renderer.gl;

		let values = 0;
		for (let key of Object.keys(attributes)) {
			values += attributes[key].size;
		}

		this.BATCH_FLOATS_PER_INDEX = values;
		this.BATCH_STRIDE = values * 4;

		this.MAX_VERTICES = maxTriangles * 3;
		this._vertexBuffer = gl.createBuffer();

		this.array = new Float32Array(this.MAX_VERTICES * this.BATCH_FLOATS_PER_INDEX);
		this._attributes = attributes;
	}

	
	public flush() {
		const gl = this._renderer.gl;
		const arrayView = this.array.subarray(0, this.arrayOffset);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, arrayView, gl.DYNAMIC_DRAW);

		const attributes = this._attributes;
		const stride = this.BATCH_STRIDE
		let attribOffset = 0;
		let attrib: Attribute;

		// enable attributes
		for (let key of Object.keys(attributes)) {
			attrib = attributes[key];
			gl.vertexAttribPointer(attrib.location, attrib.size, attrib.type, false, stride, attribOffset);
			gl.enableVertexAttribArray(attrib.location);
			attribOffset += attrib.size * 4; // assume 4 byte
		}
		this._draw(gl);
		this.arrayOffset = 0;
	}

	protected _draw(gl: WebGLRenderingContext) {
		console.assert(gl != null);
		const n = this.arrayOffset / this.BATCH_FLOATS_PER_INDEX;
		//console.log(`   render count ${n}`);
		gl.drawArrays(gl.TRIANGLES, 0, n);
	}
}
