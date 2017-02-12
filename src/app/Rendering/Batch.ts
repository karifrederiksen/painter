module TSPainter.Rendering {
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
			this._renderer = renderer;
			const gl = renderer.gl;

			const keys = Object.keys(attributes)
			let values = 0;
			for (let i = 0, ilen = keys.length; i < ilen; i++) {
				values += attributes[keys[i]].size;
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
			const keys = Object.keys(attributes);
			const stride = this.BATCH_STRIDE
			let attribOffset = 0;
			let attrib: Attribute;

			// enable attributes
			for (let i = 0, ilen = keys.length; i < ilen; i++) {
				attrib = attributes[keys[i]];
				gl.vertexAttribPointer(attrib.location, attrib.size, attrib.type, false, stride, attribOffset);
				gl.enableVertexAttribArray(attrib.location);
				attribOffset += attrib.size * 4; // assume 4 byte
			}
			this._draw(gl);
			this.arrayOffset = 0;
		}

		protected _draw(gl: WebGLRenderingContext) {
			gl.drawArrays(gl.TRIANGLES, 0, this.arrayOffset / this.BATCH_FLOATS_PER_INDEX);
		}
	}





	/*
		Uses drawElements instead of drawArrays.

		This means the buffer size is 2/3 the size of the alternative.
		Only one of these should be used as it's too expensive to rebind ELEMENTS_ARRAY_BUFFER to use multiple.
		Use this for the largest batch; DrawPoints.

		TODO: having issues with this only drawing half of a square when drawing 1 at a time.
	*/
	export class ElementsBatch extends Batch {
		public _indexBuffer: WebGLBuffer;
		public _indexArray: Uint16Array;

		constructor(renderer: Renderer, attributes: AttributeMap, maxElements: number) {
			super(renderer, attributes, Math.ceil(maxElements * 4 / 3));
			const gl = renderer.gl;

			this._indexBuffer = gl.createBuffer();
			const indexArray = new Uint16Array(this.MAX_VERTICES);
			for (let i = 0, j = 0; i < this.MAX_VERTICES; i += 6, j += 4) {
				indexArray[i + 0] = j + 0;
				indexArray[i + 1] = j + 1;
				indexArray[i + 2] = j + 2;
				indexArray[i + 3] = j + 0;
				indexArray[i + 4] = j + 2;
				indexArray[i + 5] = j + 3;
			}
			this._indexArray = indexArray;

			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._indexArray, gl.STATIC_DRAW);
		}


		protected _draw(gl: WebGLRenderingContext) {
			gl.drawElements(gl.TRIANGLES, this.arrayOffset / this.BATCH_FLOATS_PER_INDEX, gl.UNSIGNED_SHORT, 0);
		}
	}
}