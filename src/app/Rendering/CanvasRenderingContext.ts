module TSPainter {
    export class CanvRenderingContext {
        public readonly _renderer: Renderer;
        protected readonly _shaderManager: ShaderManager;
		protected readonly _textureGenerator: TextureGenerator;


        public layer: Sprite;
		public brushTexture: Texture;
		public blendMode: BlendMode;


        constructor(canvas: HTMLCanvasElement) {
            this._renderer = new Renderer(canvas, {
                alpha: true,
                depth: false,
                stencil: false,
                antialias: false,
                premultipliedAlpha: true,
                preserveDrawingBuffer: true,
                failIfMajorPerformanceCaveat: false
            });

            this._shaderManager = new ShaderManager(this._renderer);
            this._textureGenerator = new TextureGenerator(this._renderer, this._shaderManager.brushShader);

            this.layer = new Sprite(new Texture(this._renderer, canvas.width, canvas.height));
            this.brushTexture = new Texture(this._renderer, 1000, 1000);
			this._textureGenerator.generate(this.brushTexture);

			this.blendMode = Settings.getValue(Settings.ID.RenderingBlendMode);
        }

		// Test function
		public showBrushTexture() {
			this._renderToCanvas(this.brushTexture);
		}


        public renderDrawPoints(drawPoints: DrawPointQueue) {
            const drawPointShader = this._shaderManager.drawPointShader;
            const renderer = this._renderer;

			// render to output texture
			renderer.setBlendMode(this.blendMode);
			drawPointShader.setBrushTexture(this.brushTexture);
			drawPoints.addToBatch(drawPointShader.batch); // todo: ElementsBatch
			renderer.flushShader(drawPointShader, this.layer.texture);
			renderer.setBlendMode(BlendMode.Normal);

            // render output texture to canvas
            const outputShader = this._shaderManager.outputShader;
            const layer = this.layer;

            layer.addToBatch(outputShader.batch);
            outputShader.setResolution(layer.texture.width, layer.texture.height);
			outputShader.setTexture(layer.texture);

			renderer.setViewport(0, 0, layer.texture.width, layer.texture.height);
			renderer.useFrameBuffer(null);
			renderer.clear();
            renderer.flushShader(outputShader, null);
        }


        public renderSpriteToTexture(sprite: Sprite, texture: Texture, area: Vec4) {
            const renderer = this._renderer;
            renderer.useFrameBuffer(texture.framebuffer);
            if (area != null) {
                renderer.setViewport(area.x, area.y, area.width, area.height);
            }
            else {
                renderer.setViewport(0, 0, texture.width, texture.height);
            }
            renderer.renderSprite(this._shaderManager.spriteShader, sprite);
        }


        // testing
        public _renderToCanvas(texture: Texture) {
            const outputShader = this._shaderManager.outputShader;
            const layer = this.layer;
            const renderer = this._renderer;

            layer.addToBatch(outputShader.batch);
            outputShader.setResolution(layer.texture.width, layer.texture.height);
            outputShader.setTexture(texture);

            renderer.setViewport(0, 0, layer.texture.width, layer.texture.height);
            renderer.flushShader(outputShader, null);
        }
    }
}