
import { BlendMode } from "./Consts";
import { Renderer } from "./Renderer";
import { Layer } from "./Layers/Layer";
import { LayerStack } from "./Layers/LayerStack";
import { LayersRenderer } from "./Layers/LayersRenderer";
import { Texture } from "./Texture";
import { DrawPoint, addDrawPointToBatch } from "./DrawPoints"
import * as Settings from "../Global/Settings";

export class CanvRenderingContext {
	public readonly renderer: Renderer;
	public readonly layerStack: LayerStack;

	protected _layersRenderer: LayersRenderer;

	public layer: Layer;
	
	public blendMode: BlendMode;


	constructor(canvas: HTMLCanvasElement) {
		console.assert(canvas != null, `Canvas is ${canvas}`);
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
		this.layerStack.newLayer(1);
		this.layer = this.layerStack.stack[0];
		this.layer.texture.updateSize();
		this._layersRenderer = new LayersRenderer(this.renderer, this.layerStack);

		this.blendMode = Settings.getValue(Settings.ID.RenderingBlendMode);
	}


	public renderDrawPoints(drawPoints: Array<DrawPoint>, brushTexture: Texture) {
		console.assert(drawPoints != null, `DrawPoints is ${drawPoints}`);
		console.assert(brushTexture != null, `BrushTexture is ${brushTexture}`);
		//console.log("rendering to layer", this.layerStack.stack.indexOf(this.layer));
		const drawPointShader = this.renderer.shaders.drawPointShader;
		const renderer = this.renderer;
		const layer = this.layer;

		// render to output texture
		renderer.blendMode = this.blendMode;
		drawPointShader.brushTexture = brushTexture;

		addDrawPointToBatch(drawPoints, drawPointShader.batch); // todo: ElementsBatch

		// render
		renderer.flushShaderToTexture(drawPointShader, layer.texture);

		// render output texture to canvas
		this.renderLayers();
	}


	protected renderLayers() {
		const renderer = this.renderer;
		const spriteShader = renderer.shaders.spriteShader;
		const outputShader = renderer.shaders.outputShader;
		const layersRenderer = this._layersRenderer;
		const combinedLayers = this._layersRenderer.combinedLayers;
		const blendMode = renderer.blendMode;

		// save blend mode
		renderer.blendMode = BlendMode.Normal;

		// combine layers
		layersRenderer.update(this.layer);
		layersRenderer.render()
		
		// prepare render to canvas
		combinedLayers.addToBatch(outputShader.batch);
		outputShader.resolution = combinedLayers.texture.size;
		outputShader.texture = combinedLayers.texture;
		renderer.setViewport(0, 0, renderer.canvas.width, renderer.canvas.height);

		// clear canvas
		renderer.useFrameBuffer(null);
		renderer.clear();

		// render
		renderer.flushShaderToTexture(outputShader, null);
	}
}
