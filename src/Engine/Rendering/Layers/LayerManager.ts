
import { Renderer } from "../Renderer";
import { Sprite, addToBatch } from "../Sprite";
import { Texture } from "../Texture";
import { Layer, LayerBasic } from "./Layer";
import { LayerCombiner } from "./LayersCombiner";
import { LayerStack } from "./LayerStack";
import { Vec2 } from "../../Math/Vec";
import { generateBackgroundTexture } from "../TextureGenerator";
import { List } from "immutable";

export class LayerManager {
	protected _combiner: LayerCombiner;
	protected _stack: LayerStack;
	protected _current: Layer;

	public get combinedLayer() { return this._combiner.combinedLayers; }
	public get layer() { return this._current; }

	// Temporary. This should rather return an immutable structure, and without any webgl types.
	public get stack() { return <List<LayerBasic>>this._stack.stack; }


	constructor(renderer: Renderer) {
		this._stack = new LayerStack();
		this._combiner = new LayerCombiner(renderer, this._stack);

		this._stack.newLayer(renderer, 0);
		this.setLayer(this._stack.stack.first());
	}

	public newLayer(renderer: Renderer, index: number) {
		return this._stack.newLayer(renderer, index);
	}
	
	public setLayer(layer: LayerBasic|Layer) {
		this._current = <Layer>layer;
		this._combiner.setLayer(<Layer>layer);

	}

	public combine() {
		this._combiner.render();
	}

}