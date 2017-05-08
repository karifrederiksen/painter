
import { Renderer } from "./Renderer";
import { Vec2 } from "../Math/Vec";
import { GUID } from "../Common";


export class Texture {
	public readonly framebuffer: WebGLFramebuffer;
	public readonly textureWGL: WebGLTexture;		// should be a textureID instead
	public readonly id: number;
	public size: Vec2;

	constructor(renderer: Renderer, size: Vec2) {
		console.assert(renderer != null, `Renderer is ${renderer}`);
		console.assert(size.x > 0, `Width is 0 or less: ${size.x}`);
		console.assert(size.y > 0, `Height is 0 or less: ${size.y}`);
		this.size = size;
		this.id = GUID.next();

		const { gl } = renderer;
		this.textureWGL = gl.createTexture();
		this.framebuffer = gl.createFramebuffer();
		this.updateSize(renderer);
		renderer.useTextureFrameBuffer(this);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.textureWGL, 0);
	}


	public updateSize(renderer: Renderer) {
		const { gl } = renderer;
		const { x, y } = this.size;
		renderer.textureManager.bindTexture(this, 0);
		
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, x, y, 0, gl.RGBA, gl.FLOAT, null);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	}

	public destroy(renderer: Renderer) {
		const { gl } = renderer;
		gl.deleteFramebuffer(this.framebuffer);
		gl.deleteTexture(this.textureWGL);
	}
}