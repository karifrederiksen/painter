
import { Shader } from "./Shaders/Shader"
import { SpriteShader } from "./Shaders/SpriteShader"
import { ShaderContainer } from "./Shaders/ShaderContainer"
import { BlendMode } from "./Consts";
import { Vec3, Vec4 } from "../Math/Vec";
import { TextureManager } from "./TextureManager";
import { Texture } from "./Texture";
import { Sprite } from "./Sprite";


// Set up blend modes
const BLEND_MODE_VALUES: { [n: number]: number[] } = {}
BLEND_MODE_VALUES[BlendMode.Normal]   = [WebGLRenderingContext.ONE,  WebGLRenderingContext.ONE_MINUS_SRC_ALPHA];
BLEND_MODE_VALUES[BlendMode.Erase]    = [WebGLRenderingContext.ZERO, WebGLRenderingContext.ONE_MINUS_SRC_ALPHA];


export class Renderer {
	public readonly canvas: HTMLCanvasElement;
	public readonly gl: WebGLRenderingContext;
	public readonly textureManager: TextureManager
	public readonly shaders: ShaderContainer;
	public viewportArea: Vec4;


	protected _blendMode: BlendMode;

	public currentShader: Shader = null;
	public currentFrameBuffer: WebGLFramebuffer = null;

	public get blendMode() { 
		return this._blendMode;
	}
	public set blendMode(mode: BlendMode) {
		if (mode === this._blendMode) {
			return;
		}
		this.gl.blendFunc(BLEND_MODE_VALUES[mode][0], BLEND_MODE_VALUES[mode][1]);
		this._blendMode = mode;
	}

	public constructor(canvas: HTMLCanvasElement, webGlAttributes: WebGLContextAttributes) {
		console.assert(canvas != null, `Canvas is ${canvas}`);
		console.assert(webGlAttributes != null, `WebGlAttributes is ${webGlAttributes}`);
		this.canvas = canvas;
		const gl = <WebGLRenderingContext>(canvas.getContext("webgl", webGlAttributes) || canvas.getContext("experimental-webgl", webGlAttributes));
		this.gl = gl;
		
		if (gl === null) {
			throw new Error("Failed to get WebGL context");
		}
		
		gl.disable(gl.DEPTH_TEST);
		gl.enable(gl.BLEND);
		this.blendMode = BlendMode.Normal;

		if (gl.getExtension("OES_texture_float") === null) {
			throw new Error("Failed to enable the OES_texture_float extension");
		}
		if (gl.getExtension("OES_texture_float_linear") === null) {
			throw new Error("Failed to enable the OES_texture_float_linear extension");
		}
		
		this._setViewPort(0, 0, canvas.width, canvas.height);

		this.textureManager = new TextureManager(this);
		this.shaders = new ShaderContainer(this);
	}


	public useFrameBuffer(texture: Texture) {
		//var id = texture ? texture.id : "< canvas >";
		//console.log(`setting frame buffer to ${id}`);
		this._useFrameBuffer((texture !== null) ? texture.framebuffer : null);
	}


	public useShader(shader: Shader) {
		console.assert(shader != null, `Shader is ${shader}`);
		if (this.currentShader !== shader) {
			shader.activate();
			this.currentShader = shader;
		}
	}


	public flushShaderToTexture(shader: Shader, texture: Texture) {
		console.assert(shader != null, `Shader is ${shader}`);
		const id = texture ? texture.id : "< canvas >";

		//console.warn(`Starting flush: ${shader.name} to texture ${id}`)
		this.useShader(shader);
		this.useFrameBuffer(texture);
		shader.syncUniforms();
		shader.batch.flush();
		//console.warn("Ending flush")
	}


	public renderSpriteToTexture(shader: SpriteShader, sprite: Sprite, texture: Texture) {
		console.assert(shader != null, `Shader is ${shader}`);
		console.assert(sprite != null, `Sprite is ${sprite}`);
		console.assert(sprite.texture != null, `Sprite texture is ${sprite.texture}`);

		sprite.addToBatch(shader.batch);

		// set unifrms
		shader.texture = sprite.texture;
		shader.scale = sprite.scale;
		shader.rotation = sprite.rotation;

		// render
		this.flushShaderToTexture(shader, texture);
	}


	public setViewportForSprite(sprite: Sprite) {
		console.assert(sprite != null, `Sprite is ${sprite}`);
		const vpArea = this.viewportArea;
		const size = sprite.texture.size;

		if (vpArea.width === size.x && vpArea.height === size.y && vpArea.x === 0 && vpArea.y === 0) {
			return;
		}
		this._setViewPort(0, 0, size.x, size.y);
	}

	public setViewport(x: number, y: number, width: number, height: number) {
		const vpArea = this.viewportArea;
		if (vpArea.width === width && vpArea.height === height && vpArea.x === x && vpArea.y === y) {
			return;
		}
		this._setViewPort(x, y, width, height);
	}


	public clear(texture: Texture = null) {
		if (texture != null) {
			this.useFrameBuffer(texture);
		}
		this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT);
	}


	private _useFrameBuffer(fb: WebGLFramebuffer) {
		if (fb === this.currentFrameBuffer) {
			return;
		}
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, fb);
		this.currentFrameBuffer = fb;
	}

	private _setViewPort(x: number, y: number, width: number, height: number) {
		this.gl.viewport(x, y, width, height);
		this.viewportArea = Vec4.create(x, y, width, height);
	}
}