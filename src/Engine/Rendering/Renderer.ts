
import { Shader } from "./Shaders/Shader"
import { SpriteShader } from "./Shaders/SpriteShader"
import { ShaderContainer } from "./Shaders/ShaderContainer"
import { BlendModeType, BLEND_MODE_VALUES } from "./Consts";
import { Vec2, Vec3, Vec4, VecHelp } from "../Math/Vec";
import { TextureManager } from "./TextureManager";
import { Texture } from "./Texture";
import { Sprite, addToBatch } from "./Sprite";




export class Renderer {
	private _viewPortArea = Vec4.default;
	private _blendMode: BlendModeType;
	private _currentShader: Shader = null;
	private _currentFrameBuffer: WebGLFramebuffer = null;
	
	public readonly canvas: HTMLCanvasElement;
	public readonly gl: WebGLRenderingContext;
	public readonly textureManager: TextureManager
	public readonly shaders: ShaderContainer;


	public get currentFrameBuffer() { return this._currentFrameBuffer; }
	public get currentShader() { return this._currentShader; }
	public get viewPortArea() { return this._viewPortArea; }

	public get blendMode() { return this._blendMode; }
	public set blendMode(mode: BlendModeType) { this._setBlendMode(mode); }


	public constructor(canvas: HTMLCanvasElement, webGlAttributes: WebGLContextAttributes) {
		console.assert(canvas != null, `Canvas is ${canvas}`);
		console.assert(webGlAttributes != null, `WebGlAttributes is ${webGlAttributes}`);

		this.canvas = canvas;
		this.gl = this._initGl(canvas, webGlAttributes);
		this._setViewPort(0, 0, canvas.width, canvas.height);
		this.blendMode = BlendModeType.Normal;
		this.textureManager = new TextureManager(this);
		this.shaders = new ShaderContainer(this);
	}


	public getCanvasSize() { 
		return Vec2.create(this.canvas.width, this.canvas.height);
	}

	public useShader(shader: Shader) {
		console.assert(shader != null, `Shader is ${shader}`);
		if (this._currentShader !== shader) {
			shader.activate();
			this._currentShader = shader;
		}
	}

	public useCanvasFrameBuffer() {
		this._useFrameBuffer(null);
	}

	public useTextureFrameBuffer(texture: Texture) {
		console.assert(texture != null, `Texture is ${texture}`);
		//var id = texture ? texture.id : "< canvas >";
		//console.log(`setting frame buffer to ${id}`);
		this._useFrameBuffer(texture.framebuffer);
	}

	public flushShaderToTexture(shader: Shader, texture: Texture) {
		console.assert(shader != null, `Shader is ${shader}`);
		const id = texture.id;

		//console.warn(`Starting flush: ${shader.name} to texture ${id}`)
		this.useShader(shader);
		this.useTextureFrameBuffer(texture);
		shader.syncUniforms();
		shader.batch.flush();
		//console.warn("Ending flush")
	}

	public flushShaderToCanvas(shader: Shader) {
		console.assert(shader != null, `Shader is ${shader}`);

		//console.warn(`Starting flush: ${shader.name} to texture ${id}`)
		this.useShader(shader);
		this.useCanvasFrameBuffer();
		shader.syncUniforms();
		shader.batch.flush();
		//console.warn("Ending flush")
	}

	public setViewPort(area: Vec4) {
		console.assert(area != null, `Area is ${area}`);
		return this._setViewPort(area.x, area.y, area.width, area.height);
	}

	public setViewportForTexture(texture: Texture) {
		console.assert(texture != null, `Texture is ${texture}`);
		const size = texture.size;
		return this._setViewPort(0, 0, size.x, size.y);
	}

	public setViewPortForSprite(sprite: Sprite) {
		console.assert(sprite != null, `Sprite is ${sprite}`);
		const size = sprite.texture.size;
		return this._setViewPort(0, 0, size.x, size.y);
	}

	public setViewPortForCanvas() {
		const canvas = this.canvas;
		return this._setViewPort(0, 0, canvas.width, canvas.height);
	}

	public clearCanvas() {
		this.useCanvasFrameBuffer();
		this._clear();
	}

	public clearTexture(texture: Texture) {
		this.useTextureFrameBuffer(texture);
		this._clear();
	}






	// Direct interaction with GL


	private _initGl(canvas: HTMLCanvasElement, webGlAttributes: WebGLContextAttributes) {
		const gl = <WebGLRenderingContext>(canvas.getContext("webgl", webGlAttributes) || canvas.getContext("experimental-webgl", webGlAttributes));
		
		if (gl === null) {
			throw new Error("Failed to get WebGL context");
		}
		
		gl.disable(gl.DEPTH_TEST);
		gl.enable(gl.BLEND);

		if (gl.getExtension("OES_texture_float") === null) {
			throw new Error("Failed to enable the OES_texture_float extension");
		}
		if (gl.getExtension("OES_texture_float_linear") === null) {
			throw new Error("Failed to enable the OES_texture_float_linear extension");
		}
		return gl;
	}

	private _setBlendMode(mode: BlendModeType) {
		if (mode === this._blendMode) {
			return;
		}
		this.gl.blendFunc(BLEND_MODE_VALUES[mode].sfact, BLEND_MODE_VALUES[mode].dfact);
		this._blendMode = mode;
	}

	private _clear() {
		this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT);
	}

	private _useFrameBuffer(fb: WebGLFramebuffer) {
		if (fb === this._currentFrameBuffer) {
			return;
		}
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, fb);
		this._currentFrameBuffer = fb;
	}

	private _setViewPort(x: number, y: number, width: number, height: number) {
		const vpArea = this._viewPortArea;
		if (VecHelp.vec4EqualsPrimitives(vpArea, x, y, width, height)) {
			return;
		}
		this.gl.viewport(x, y, width, height);
		this._viewPortArea = Vec4.create(x, y, width, height);
	}
}