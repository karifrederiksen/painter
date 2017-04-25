
import { Renderer } from "../Renderer";
import { Sprite, addToBatch } from "../Sprite";
import { Texture } from "../Texture";
import { Layer, LayerBasic } from "./Layer";
import { LayerCombiner } from "./LayersCombiner";
import { LayerStack } from "./LayerStack";
import { Vec2 } from "../../Math/Vec";
import { generateBackgroundTexture } from "../TextureGenerator";
import { Settings } from "../../Global/Settings";
import { List } from "immutable";

export class LayerManager {
	protected _combiner: LayerCombiner;
	protected _stack: LayerStack;
	protected _current: Layer;

	public get combined() { return this._combiner.combinedLayers; }
	public get currentLayer() { return this._current; }

	// Temporary. This should rather return an immutable structure, and without any webgl types.
	public get stack() { return <List<LayerBasic>>this._stack.stack; }


	constructor(renderer: Renderer) {
		this._stack = new LayerStack();
		this._combiner = new LayerCombiner(renderer, this._stack);

		this._stack.newLayer(renderer, 0);
		console.log(this._stack.first());
		this.setLayer(this._stack.first());
	}

	public newLayer(renderer: Renderer, index: number) {
		return this._stack.newLayer(renderer, index);
	}
	
	public setLayer(layer: LayerBasic|Layer) {
		console.assert(layer != null, `Layer is ${layer}`);
		console.assert(this._stack.stack.contains(<Layer>layer));
		console.log(layer);
		this._current = <Layer>layer;
		this._combiner.setLayer(<Layer>layer);
		Settings.layers.current.broadcast(layer);

	}

	public combine() {
		this._combiner.render();
	}

}