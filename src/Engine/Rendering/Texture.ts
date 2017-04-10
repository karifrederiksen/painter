
import { Renderer } from "./Renderer";
import { Vec2 } from "../Math/Vec2";


export class Texture {
	private static _nextId = 0;

	protected readonly _renderer: Renderer;
	public stencilBuffer: WebGLRenderbuffer;
	public framebuffer: WebGLFramebuffer;
	public textureWGL: WebGLTexture;		// should be a textureID instead
	public size: Vec2;
	public id: number;

	constructor(renderer: Renderer, width = 100, height = 100) {
		console.assert(renderer != null, `Renderer is ${renderer}`);
		console.assert(width > 0, `Width is 0 or less: ${width}`);
		console.assert(height > 0, `Height is 0 or less: ${height}`);
		this._renderer = renderer;
		this.size = Vec2.create(width, height);
		this.id = Texture._nextId++;

		const gl = renderer.gl;
		this.textureWGL = gl.createTexture();
		this.framebuffer = gl.createFramebuffer();
		this.updateSize();
		renderer.useFrameBuffer(this);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.textureWGL, 0);
	}


	public updateSize() {
		const gl = this._renderer.gl;
		const size = this.size;

		gl.bindTexture(gl.TEXTURE_2D, this.textureWGL);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size.x, size.y, 0, gl.RGBA, gl.FLOAT, null);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	}
}