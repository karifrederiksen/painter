
import { Renderer } from "../Renderer";
import { Sprite } from "../Sprite";
import { Texture } from "../Texture";
import { Layer } from "./Layer";
import { LayerStack } from "./LayerStack";



/*
	Renders all the layers in the LayerStack onto a single Texture
*/
export class LayersRenderer {
	protected _renderer: Renderer;
	protected _layerStack: LayerStack;
	protected _currentLayer: Layer = null;

	protected _layersBelow: Sprite;
	protected _layersAbove: Sprite;

	public combinedLayers: Sprite;

	constructor(renderer: Renderer, layerStack: LayerStack) {
		console.assert(renderer != null);
		console.assert(layerStack != null);
		this._renderer = renderer;
		this._layerStack = layerStack;

		const width = renderer.canvas.width;
		const height = renderer.canvas.height;

		this.combinedLayers = new Sprite(new Texture(renderer, width, height));
		this._layersBelow = new Sprite(new Texture(renderer, width, height));
		this._layersAbove = new Sprite(new Texture(renderer, width, height));
	}


	public update(currentLayer: Layer) {
		console.assert(currentLayer != null);
		if (this._currentLayer === currentLayer) {
			return;
		}
		this._currentLayer = currentLayer;


		const renderer = this._renderer;
		const shader = renderer.shaders.spriteShader;
		const combined = this.combinedLayers;
		const stack = this._layerStack.stack;
		const currentLayerIdx = this._layerStack.stack.indexOf(currentLayer);

		// below
		const below = this._layersBelow;
		//renderer.clear(below.texture);
		renderer.setViewportForSprite(below);
		for (let i = 0; i < currentLayerIdx; i++) {
			console.log("current layer idx", currentLayerIdx);
			renderer.renderSpriteToTexture(shader, stack[i], below.texture);
		}


		// above
		const above = this._layersAbove;
		//renderer.clear(above.texture);
		renderer.setViewportForSprite(above);
		for (let i = currentLayerIdx + 1, ilen = stack.length; i < ilen; i++) {
			renderer.renderSpriteToTexture(shader, stack[i], above.texture);
		}
	}


	public render() {
		const renderer = this._renderer;
		const shader = renderer.shaders.spriteShader;
		const combined = this.combinedLayers;

		renderer.clear(combined.texture);
		renderer.setViewportForSprite(combined);
		renderer.renderSpriteToTexture(shader, this._layersBelow, combined.texture);
		renderer.renderSpriteToTexture(shader, this._currentLayer, combined.texture);
		renderer.renderSpriteToTexture(shader, this._layersAbove, combined.texture);
	}
}
