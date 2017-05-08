
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
	private drawPoints: Iterable<number, DrawPoint> = List<DrawPoint>();

	public readonly renderer: Renderer;
	public readonly layerManager: LayerManager;
	
	public blendMode: BlendModeType;


	constructor(renderer: Renderer) {
		this.renderer = renderer;

		this.layerManager = new LayerManager(this);
		this.layerManager.newLayer(1);


		this.blendMode = Settings.rendering.blendMode.value;

		Settings.layers.current.subscribe((layer) => {
			if (layer !== this.layerManager.currentLayer.layer) {
				this.layerManager.setLayer(layer);
			}
		});
	}

	public addDrawPoints(points: Iterable<number, DrawPoint>) {
		this.drawPoints = this.drawPoints.concat(points);
	}


	public renderDrawPoints(brushTexture: Texture) {
		if (this.drawPoints.isEmpty()) {
			return;
		}
		this._renderDrawPoints(this.drawPoints, brushTexture);
		this.renderToCanvas();
		this.drawPoints = List<DrawPoint>();
	}


	public renderToCanvas() {
		const renderer = this.renderer;
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


	private _renderDrawPoints(drawPoints: Iterable<number, DrawPoint>, brushTexture: Texture) {
		console.assert(drawPoints != null, `DrawPoints is ${drawPoints}`);
		console.assert(brushTexture != null, `BrushTexture is ${brushTexture}`);

		//console.log("rendering to layer", this.layerStack.stack.indexOf(this.layer));
		const drawPointShader = this.renderer.shaders.drawPointShader;
		const renderer = this.renderer;
		const layerSprite = this.layerManager.currentLayer;

		// render to output texture
		renderer.blendMode = this.blendMode;
		drawPointShader.brushTexture = brushTexture;

		addDrawPointToBatch(drawPoints.toArray(), drawPointShader.batch);

		// render
		renderer.setViewPortForSprite(layerSprite.sprite);
		renderer.flushShaderToTexture(drawPointShader, layerSprite.sprite.texture);
	}
}


// interface UVs {
// 	x0: number;
// 	y0: number;
// 	x1: number;
// 	y1: number;
// }

// function getArea(drawPoints: Iterable<number, DrawPoint>): UVs {
// 	const first = drawPoints.first();
// 	let x0 = first.position.x - first.size / 2;
// 	let y0 = first.position.y - first.size / 2;
// 	let x1 = x0 + first.size;
// 	let y1 = y0 + first.size;


// 	for (let i = 0, ilen = drawPoints.count(); i < ilen; i++) {
// 		const point = drawPoints.get(i);
// 		const pos = point.position;
// 		const size = point.size;
// 		const halfSize = size / 2;

// 		x0 = Math.min(x0, pos.x - halfSize);
// 		y0 = Math.min(y0, pos.y - halfSize);
// 		x1 = Math.max(x1, pos.x + halfSize);
// 		y1 = Math.max(y1, pos.y + halfSize);
// 	}
// 	return { x0, y0, x1, y1 };
// }