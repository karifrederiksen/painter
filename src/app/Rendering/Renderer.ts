/// <reference path="Texture.ts"/>
/// <reference path="Consts.ts"/>

module TSPainter {


	// Set up blend modes
	const BLEND_MODE_VALUES: { [n: number]: number[] } = {}
	BLEND_MODE_VALUES[BlendMode.Normal] = [WebGLRenderingContext.ONE, WebGLRenderingContext.ONE_MINUS_SRC_ALPHA];
	BLEND_MODE_VALUES[BlendMode.Erase] = [WebGLRenderingContext.ZERO, WebGLRenderingContext.ONE_MINUS_SRC_ALPHA];


    export class Renderer {
        public readonly canvas: HTMLCanvasElement;
        public readonly gl: WebGLRenderingContext;
		public readonly viewportArea = new Vec4();
		public readonly textureManager = new TextureManager(this);

		public currentShader: Shader = null;
        public currentFrameBuffer: WebGLFramebuffer = null;


        public constructor(canvas: HTMLCanvasElement, webGlAttributes: WebGLContextAttributes) {
            this.canvas = canvas;
            const gl = <WebGLRenderingContext>(canvas.getContext("webgl", webGlAttributes) || canvas.getContext("experimental-webgl", webGlAttributes));
			this.gl = gl;

            if (gl === null) {
				console.error("Failed to get WebGL context.");
                throw new Error();
            }
            
			gl.enable(gl.BLEND);
			this.setBlendMode(BlendMode.Normal);

			if (gl.getExtension("OES_texture_float") === null) {
				console.error("Failed to enable the OES_texture_float extension");
				throw new Error();
			}
			if (gl.getExtension("OES_texture_float_linear") === null) {
				console.error("Failed to enable the OES_texture_float_linear extension");
				throw new Error();
			}
            
			this.setViewport(0, 0, canvas.width, canvas.height);
		}


		public setBlendMode(mode: BlendMode) {
			const vals = BLEND_MODE_VALUES[mode];
			this.gl.blendFunc(vals[0], vals[1]);
		}


        public useFrameBuffer(fb: WebGLFramebuffer) {
            if (fb === this.currentFrameBuffer)
                return;
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
            shader.syncUniforms();
            shader.render(sprite);
        }


        public flushShader(shader: Shader, texture: Texture) {
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
            if (vpArea.width == width && vpArea.height === height && vpArea.x === x && vpArea.y === y)
				return;
            this.gl.viewport(x, y, width, height);
            vpArea.xyzw(x, y, width, height);
		}
    }
}