
import { Renderer } from "../Renderer";
import { RenderingContext } from "../RenderingContext";
import { Sprite, addToBatch } from "../Sprite";
import { Texture } from "../Texture";
import { Layer,  } from "./Layer";
import { LayerCombiner } from "./LayersCombiner";
import { LayerStack, LayerSpriteSet } from "./LayerStack";
import { Vec2 } from "../../Math/Vec";
import { generateBackgroundTexture } from "../TextureGenerator";
import { Settings } from "../../Global/Settings";
import { List } from "immutable";

export class LayerManager {
	protected readonly _renderingContext: RenderingContext;
	protected readonly _renderer: Renderer;
	protected readonly _combiner: LayerCombiner;
	protected readonly _stack: LayerStack;
	protected _current: LayerSpriteSet;

	public get combined() { return this._combiner.combinedLayers; }
	public get currentLayer() { return this._current; }

	// Temporary. This should rather return an immutable structure, and without any webgl types.
	public get stack() { 
		const current = this._current.layer;
		return this._stack.layerStack;
	}


	constructor(renderingContext: RenderingContext) {
		this._renderingContext = renderingContext;
		this._renderer = renderingContext.renderer;
		this._stack = new LayerStack();
		this._combiner = new LayerCombiner(this._renderer, this._stack);

		this._stack.newLayer(this._renderer, 0);
		console.log(this._stack.first());
		this.setLayer(this._stack.first().layer);
	}

	public newLayer(index?: number) {
		index = index || this._stack.layerSpriteStack.indexOf(this._current);
		return this._stack.newLayer(this._renderer, index);
	}
	
	public setLayer(layer: Layer) {
		console.assert(layer != null, `Layer is ${layer}`);
		console.info(`Selected layer ${layer.id}`);
		const lsSet = this._stack.layerSpriteStack.filter(val => val.layer === layer).first();
		console.assert(lsSet != null);
		
		this._current = lsSet;
		this._combiner.setLayer(lsSet);
		this._combiner.render();
		Settings.layers.current.broadcast(layer);
	}

	public toggleVisibility() {
		const currentLayer = this._current.layer;
		const newLayer = currentLayer.set({ visible: !currentLayer.visible });
		
		console.info(`Toggling current layer to ${newLayer.visible ? "" : "in"}visible`);

		this._current = this._stack.replace(currentLayer, newLayer);
		Settings.layers.current.broadcast(this._current.layer);
		this._combiner.setLayer(this._current);
		this._combiner.render();
		this._renderingContext.renderToCanvas();
	}

	public combine() {
		this._combiner.render();
	}
}