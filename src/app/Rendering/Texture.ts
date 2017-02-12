module TSPainter.Rendering {
	export class Texture {
		protected readonly _renderer: Renderer;
		public stencilBuffer: WebGLRenderbuffer;
		public framebuffer: WebGLFramebuffer;
		public textureWGL: WebGLTexture;		// should be a textureID instead
		public width: number;
		public height: number;

		constructor(renderer: Renderer, width = 100, height = 100) {
			this._renderer = renderer;
			this.width = width;
			this.height = height;

			const gl = renderer.gl;
			this.textureWGL = gl.createTexture();
			this.framebuffer = gl.createFramebuffer();
			this.updateSize();
			renderer.useTextureFrameBuffer(this);
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.textureWGL, 0);
		}


		public updateSize() {
			const gl = this._renderer.gl;

			gl.bindTexture(gl.TEXTURE_2D, this.textureWGL);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.FLOAT, null);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		}
	}
}