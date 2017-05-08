
import { Layer } from "./Layer";
import { LayerCombiner } from "./LayersCombiner";
import { Renderer } from "../Renderer";
import { Texture } from "../Texture";
import { Sprite } from "../Sprite";
import { Vec2 } from "../../Math/Vec";
import { Settings } from "../../Global/Settings";
import { List, OrderedMap } from "immutable";



export class LayerSpriteSet {
	constructor(
		public readonly layer: Layer,
		public readonly sprite: Sprite
	){
		Object.freeze(this);
	}
}

/*
	Contains the layer stack.
	
	The bottom of the stack is at index 0. Top is at layerStack.length-1.
	Layers will be rendered in the stack's order.

	Used for manipulating the layer stack and the contained layers.
*/
export class LayerStack {
	protected _layerStack: List<LayerSpriteSet> = List<LayerSpriteSet>();

	public get layerSpriteStack() { return this._layerStack; }

	// TODO: this can be memoized
	public get layerStack() { return this._layerStack.map((val) => val.layer); }


	public first() {
		return this.layerSpriteStack.first();
	}

	public last() {
		return this.layerSpriteStack.last();
	}

	public count() {
		return this.layerSpriteStack.count();
	}

	public get(index: number) {
		console.assert(index > 0);
		console.assert(index < this.count());
		return this.layerSpriteStack.get(index);
	}


	/*
		Add a Layer at the specified index
	*/
	public newLayer(renderer: Renderer, index: number) {
		console.assert(index >= 0);
		console.info(`New layer at index ${index}`);
		const texture = new Texture(renderer, renderer.getCanvasSize());
		const sprite = new Sprite(texture);
		const layer = Layer.createWithSprite(sprite, null, true);

		this._layerStack = this._layerStack.insert(index, new LayerSpriteSet(layer, sprite));
		Settings.layers.stack.broadcast(this.layerStack);
	}


	/*
		Move a layer to a different index
	*/
	public moveLayerToIdx(fromIndex: number, toIndex: number) {
		console.assert(fromIndex !== toIndex);
		console.assert(fromIndex >= 0);
		console.assert(fromIndex < this._layerStack.count());
		console.assert(toIndex >= 0);
		console.assert(toIndex < this._layerStack.count());
		console.info(`Moving layer from index ${fromIndex} at ${toIndex}`);
		
		
		const layer = this._layerStack.get(fromIndex);
		const tmpStack = this._layerStack.remove(fromIndex);
		if (fromIndex > toIndex) {
			fromIndex++;
		}
		this._layerStack = tmpStack.insert(fromIndex, layer);
		
		Settings.layers.stack.broadcast(this.layerStack);
	}


	/*
		Remove and return a layer from the stack
	*/
	public removeLayer(index: number) {
		console.assert(index >= 0);
		console.info(`Removing  layer at index ${index}`);
		const layer = this._layerStack.get(index);
		this._layerStack = this._layerStack.remove(index);
		
		Settings.layers.stack.broadcast(this.layerStack);
		return layer;
	}


	/*
		Insert a layer back into the stack after it's been removed (undo/redo)
	*/
	public insertLayer(layer: LayerSpriteSet, index: number) {
		console.assert(layer != null);
		console.assert(index >= 0);
		console.info(`Inserting old layer with id ${layer.layer.id} at index ${index}`);

		this._layerStack = this._layerStack.insert(index, layer);
		Settings.layers.stack.broadcast(this.layerStack);
	}

	public replace(layer: Layer, newLayer: Layer) {
		console.info(`Replacing layer with id ${layer.id} with new layer with id ${newLayer.id}`);
		const index = this._layerStack.findIndex(val => val.layer === layer);
		const prev = this._layerStack.get(index);
		const newSet = new LayerSpriteSet(newLayer, prev.sprite);
		this._layerStack = this._layerStack.set(index, newSet);
		
		Settings.layers.stack.broadcast(this.layerStack);
		return newSet;
	}
}