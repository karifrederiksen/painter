module TSPainter.Rendering {
	export class CanvRenderingContext {
		public readonly renderer: Renderer;
		public readonly layerStack: LayerStack;

		//protected combinedLayers: Sprite;

		public layer: Layer;
		
		public blendMode: BlendMode;


		constructor(canvas: HTMLCanvasElement) {
			this.renderer = new Renderer(canvas, {
				alpha: true,
				depth: false,
				stencil: false,
				antialias: false,
				premultipliedAlpha: true,
				preserveDrawingBuffer: true,
				failIfMajorPerformanceCaveat: false
			});

			this.layerStack = new LayerStack(this.renderer);

			this.layerStack.newLayer(0);
			this.layer = this.layerStack.stack[0];
			this.layer.texture.width = Settings.getValue(Settings.ID.CanvasWidth);
			this.layer.texture.height = Settings.getValue(Settings.ID.CanvasHeight);
			this.layer.texture.updateSize();
			//this.combinedLayers = new Sprite(new Texture(this.renderer, this.renderer.canvas.width, this.renderer.canvas.height));

			this.blendMode = Settings.getValue(Settings.ID.RenderingBlendMode);
		}


		public renderDrawPoints(drawPoints: DrawPointQueue, brushTexture: Texture) {
			const drawPointShader = this.renderer.shaders.drawPointShader;
			const renderer = this.renderer;
			const layer = this.layer;

			// render to output texture
			renderer.blendMode = this.blendMode;
			drawPointShader.setBrushTexture(brushTexture);
			drawPoints.addToBatch(drawPointShader.batch); // todo: ElementsBatch
			renderer.flushShaderToTexture(drawPointShader, layer.texture);
			renderer.blendMode = BlendMode.Normal;

			// render output texture to canvas
			const outputShader = this.renderer.shaders.outputShader;

			layer.addToBatch(outputShader.batch);
			outputShader.setResolution(layer.texture.width, layer.texture.height);
			outputShader.setTexture(layer.texture);

			renderer.setViewport(0, 0, layer.texture.width, layer.texture.height);
			renderer.useFrameBuffer(null);
			renderer.clear();
			renderer.flushShaderToTexture(outputShader, null);
			//this.renderLayers();
		}


		/*protected renderLayers() {
			const renderer = this.renderer;
			const outputShader = renderer.shaders.outputShader;
			const combinedLayers = this.combinedLayers;

			// combine layers
			renderer.blendMode = BlendMode.Normal;
			renderer.renderSpriteToTexture(this.layer, combinedLayers.texture, null);

			// render to HTMLCanvas
			combinedLayers.addToBatch(outputShader.batch);
			outputShader.setResolution(combinedLayers.texture.width, combinedLayers.texture.height);
			outputShader.setTexture(combinedLayers.texture);

			renderer.setViewport(0, 0, renderer.canvas.width, renderer.canvas.height);
			renderer.useFrameBuffer(null);
			renderer.clear();
			renderer.flushShaderToTexture(outputShader, null);
		}


		// testing
		public _renderToCanvas(texture: Texture) {
			const outputShader = this.renderer.shaders.outputShader;
			const layer = this.layer;
			const renderer = this.renderer;

			layer.addToBatch(outputShader.batch);
			outputShader.setResolution(layer.texture.width, layer.texture.height);
			outputShader.setTexture(texture);

			renderer.setViewport(0, 0, layer.texture.width, layer.texture.height);
			renderer.flushShaderToTexture(outputShader, null);
		}*/
	}
}