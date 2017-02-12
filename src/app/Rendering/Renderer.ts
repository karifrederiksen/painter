/// <reference path="Texture.ts"/>
/// <reference path="Consts.ts"/>

module TSPainter.Rendering {


	// Set up blend modes
	const BLEND_MODE_VALUES: { [n: number]: number[] } = {}
	BLEND_MODE_VALUES[BlendMode.Normal]   = [WebGLRenderingContext.ONE,  WebGLRenderingContext.ONE_MINUS_SRC_ALPHA];
	BLEND_MODE_VALUES[BlendMode.Erase]    = [WebGLRenderingContext.ZERO, WebGLRenderingContext.ONE_MINUS_SRC_ALPHA];


	export class Renderer {
		public readonly canvas: HTMLCanvasElement;
		public readonly gl: WebGLRenderingContext;
		public readonly viewportArea = new Vec4();
		public readonly textureManager: TextureManager
		public readonly shaders: ShaderContainer;


		protected _blendMode: BlendMode;

		public currentShader: Shader = null;
		public currentFrameBuffer: WebGLFramebuffer = null;

		public get blendMode() { return this._blendMode; }
		public set blendMode(mode: BlendMode) {
			if (mode === this._blendMode) {
				return;
			}
			this.gl.blendFunc(BLEND_MODE_VALUES[mode][0], BLEND_MODE_VALUES[mode][1]);
			this._blendMode = mode;
		}

		public constructor(canvas: HTMLCanvasElement, webGlAttributes: WebGLContextAttributes) {
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
			
			this.setViewport(0, 0, canvas.width, canvas.height);

			this.textureManager = new TextureManager(this);
			this.shaders = new ShaderContainer(this);
		}


		public useFrameBuffer(fb: WebGLFramebuffer) {
			if (fb === this.currentFrameBuffer) {
				return;
			}
			this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, fb);
			this.currentFrameBuffer = fb;
		}


		public useTextureFrameBuffer(texture: Texture) {
			this.useFrameBuffer((texture === null) ? null : texture.framebuffer);
		}


		public useShader(shader: Shader) {
			if (this.currentShader !== shader) {
				shader.activate();
				this.currentShader = shader;
			}
		}


		public renderSprite(shader: SpriteShader, sprite: Sprite) {
			this.useShader(shader);
			this.useTextureFrameBuffer(sprite.texture);

			// set uniforms
			shader.setTexture(sprite.texture);
			shader.setScale(sprite.scale);
			shader.setRotation(sprite.rotation);
			shader.syncUniforms();

			// render
			sprite.addToBatch(shader.batch);
			shader.batch.flush();
		}


		public renderSpriteToTexture(sprite: Sprite, texture: Texture, area: Vec4) {
			if (sprite.texture === texture) {
				console.error("sprite.texture and texture are the same");
				return;
			}

			this.useFrameBuffer(texture.framebuffer);
			if (area != null) {
				this.setViewport(area.x, area.y, area.width, area.height);
			}
			else {
				this.setViewport(0, 0, texture.width, texture.height);
			}
			this.renderSprite(this.shaders.spriteShader, sprite);
		}


		public flushShaderToTexture(shader: Shader, texture: Texture) {
			this.useShader(shader);
			this.useTextureFrameBuffer(texture);
			shader.syncUniforms();
			shader.batch.flush();
		}


		public clear() {
			this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
			this.gl.clear(this.gl.COLOR_BUFFER_BIT);
		}


		public setViewport(x: number, y: number, width: number, height: number) {
			const vpArea = this.viewportArea;
			if (vpArea.width == width && vpArea.height === height && vpArea.x === x && vpArea.y === y) {
				return;
			}
			this.gl.viewport(x, y, width, height);
			vpArea.xyzw(x, y, width, height);
		}
	}
}