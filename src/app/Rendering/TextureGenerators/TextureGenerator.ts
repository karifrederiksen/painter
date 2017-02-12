module TSPainter.Rendering {
	/*
		Base class for texture generation.
	*/
	export class TextureGenerator {
		protected readonly _renderer: Renderer;
		protected _rttBuffer: WebGLBuffer;
		protected _vertexArray: Float32Array;

		protected _shader: Shader;


		constructor(renderer: Renderer, standardBrushShader: Shader) {
			this._renderer = renderer;
			this._shader = standardBrushShader;
			this._rttBuffer = renderer.gl.createBuffer();
			this._vertexArray = new Float32Array([
				-1, -1,
				-1, 1,
				1, -1,
				1, -1,
				-1, 1,
				1, 1
			]);
		}


		public generate(texture: Texture) {
			const renderer = this._renderer;
			const gl = renderer.gl;

			renderer.useShader(this._shader);

			// update uniforms
			this._setUniforms();
			this._shader.syncUniforms();

			// store and change viewport
			const vpw = renderer.viewportArea.width;
			const vph = renderer.viewportArea.height;
			renderer.setViewport(0, 0, texture.width, texture.height);

			// set the framebuffer
			texture.updateSize();
			renderer.useFrameBuffer(texture.framebuffer);

			// buffer the vertices
			gl.bindBuffer(gl.ARRAY_BUFFER, this._rttBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, this._vertexArray, gl.STATIC_DRAW);

			// sync attributes
			const aPosLoc = this._shader.attributes["aPosition"].location;
			gl.vertexAttribPointer(aPosLoc, 2, gl.FLOAT, false, 0, 0);
			gl.enableVertexAttribArray(aPosLoc);

			// draw
			gl.drawArrays(gl.TRIANGLES, 0, 6);

			// restore viewport
			renderer.setViewport(0, 0, vpw, vph);
		}

		protected _setUniforms() { }
	}
}