
import { BlendModeType } from "./Consts";
import { Renderer } from "./Renderer";
import { addToBatch } from "./Sprite"
import { Layer } from "./Layers/Layer";
import { LayerStack } from "./Layers/LayerStack";
import { LayerManager } from "./Layers/LayerManager";
import { Texture } from "./Texture";
import { DrawPoint, addDrawPointToBatch } from "./DrawPoints";
import { Vec4 } from "../Math/Vec";
import { Settings } from "../Global/Settings";
import { Iterable, List } from "immutable";

export class RenderingContext {
	public readonly renderer: Renderer;
	public readonly layerManager: LayerManager;
	
	public blendMode: BlendModeType;


	constructor(canvas: HTMLCanvasElement) {
		console.assert(canvas != null, `Canvas is ${canvas}`);
		const renderer = new Renderer(canvas, {
			alpha: true,
			depth: false,
			stencil: false,
			antialias: false,
			premultipliedAlpha: true,
			preserveDrawingBuffer: true,
			failIfMajorPerformanceCaveat: false
		});
		this.renderer = renderer;

		this.layerManager = new LayerManager(renderer);
		this.layerManager.newLayer(renderer, 1);


		this.blendMode = Settings.rendering.blendMode.value;

		Settings.layers.current.subscribe((layer) => {
			if (layer !== this.layerManager.currentLayer) {
				this.layerManager.setLayer(layer);
			}
		});
	}


	public renderDrawPoints(drawPoints: Iterable<number, DrawPoint>, brushTexture: Texture) {
		console.assert(drawPoints != null, `DrawPoints is ${drawPoints}`);
		console.assert(brushTexture != null, `BrushTexture is ${brushTexture}`);

		//console.log("rendering to layer", this.layerStack.stack.indexOf(this.layer));
		const drawPointShader = this.renderer.shaders.drawPointShader;
		const renderer = this.renderer;
		const layer = this.layerManager.currentLayer;

		// render to output texture
		renderer.blendMode = this.blendMode;
		drawPointShader.brushTexture = brushTexture;

		addDrawPointToBatch(drawPoints.toArray(), drawPointShader.batch); // todo: ElementsBatch

		// render
		renderer.setViewPortForSprite(layer.sprite);
		renderer.flushShaderToTexture(drawPointShader, layer.sprite.texture);


		const outputShader = renderer.shaders.outputShader;
		const combinedLayers = this.layerManager.combined;

		// render output texture to canvas
		renderer.blendMode = BlendModeType.Normal;
		
		// combine layers
		this.layerManager.combine();

		// prepare render to canvas
		addToBatch(combinedLayers, outputShader.batch);
		outputShader.resolution = combinedLayers.texture.size;
		outputShader.texture = combinedLayers.texture;
		renderer.setViewPortForCanvas();

		// clear canvas
		renderer.useCanvasFrameBuffer();
		renderer.clearCanvas();

		// render
		renderer.flushShaderToCanvas(outputShader);
	}
}
