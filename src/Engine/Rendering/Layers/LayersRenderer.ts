
import { Renderer } from "../Renderer";
import { Sprite, addToBatch } from "../Sprite";
import { Texture } from "../Texture";
import { Layer } from "./Layer";
import { LayerStack } from "./LayerStack";
import { Vec2 } from "../../Math/Vec";
import { generateBackgroundTexture } from "../TextureGenerator";


/*
	Renders all the layers in the LayerStack onto a single Texture
*/
export class LayersRenderer {
	protected _renderer: Renderer;
	protected _layerStack: LayerStack;
	protected _currentLayer: Layer = null;

	protected _layersBelow: Sprite;
	protected _layersAbove: Sprite;
	protected _background: Sprite;

	public combinedLayers: Sprite;

	constructor(renderer: Renderer, layerStack: LayerStack) {
		console.assert(renderer != null);
		console.assert(layerStack != null);
		this._renderer = renderer;
		this._layerStack = layerStack;

		const size = renderer.getCanvasSize();

		this.combinedLayers = new Sprite(new Texture(renderer, size));
		this._layersBelow = new Sprite(new Texture(renderer, size));
		this._layersAbove = new Sprite(new Texture(renderer, size));
		this._background = new Sprite(new Texture(renderer, size));
		generateBackgroundTexture(renderer, this._background.texture);
	}


	public update(currentLayer: Layer) {
		console.assert(currentLayer != null);
		if (this._currentLayer === currentLayer) {
			return;
		}
		this._currentLayer = currentLayer;

		const renderer = this._renderer;
		const combined = this.combinedLayers;
		const stack = this._layerStack.stack;
		const currentLayerIdx = this._layerStack.stack.indexOf(currentLayer);

		// below
		const below = this._layersBelow;
		//renderer.clear(below.texture);
		renderer.setViewportForSprite(below);
		this.renderSpriteToTexture(this._background, below.texture);
		for (let i = 0; i < currentLayerIdx; i++) {
			console.log("current layer idx", currentLayerIdx);
			this.renderSpriteToTexture(stack[i], below.texture);
		}


		// above
		const above = this._layersAbove;
		//renderer.clear(above.texture);
		renderer.setViewportForSprite(above);
		for (let i = currentLayerIdx + 1, ilen = stack.length; i < ilen; i++) {
			this.renderSpriteToTexture(stack[i], above.texture);
		}
	}


	public render() {
		const renderer = this._renderer;
		const combined = this.combinedLayers;

		renderer.clearTexture(combined.texture);
		renderer.setViewportForSprite(combined);
		this.renderSpriteToTexture(this._layersBelow, combined.texture);
		this.renderSpriteToTexture(this._currentLayer, combined.texture);
		this.renderSpriteToTexture(this._layersAbove, combined.texture);
	}

	
	public renderSpriteToTexture(sprite: Sprite, texture: Texture) {
		console.assert(sprite != null, `Sprite is ${sprite}`);
		console.assert(sprite.texture != null, `Sprite texture is ${sprite.texture}`);

		const renderer = this._renderer;
		const shader = renderer.shaders.spriteShader;

		addToBatch(sprite, shader.batch);

		// set unifrms
		shader.texture = sprite.texture;
		shader.scale = sprite.scale;
		shader.rotation = sprite.rotation;

		// render
		renderer.flushShaderToTexture(shader, texture);
	}
}
