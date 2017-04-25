
import { Layer } from "./Layer";
import { LayerCombiner } from "./LayersCombiner";
import { Renderer } from "../Renderer";
import { Texture } from "../Texture";
import { Sprite } from "../Sprite";
import { Vec2 } from "../../Math/Vec";
import { Settings } from "../../Global/Settings";
import { List } from "immutable";

/*
	Contains the layer stack.
	
	The bottom of the stack is at index 0. Top is at layerStack.length-1.
	Layers will be rendered in the stack's order.

	Used for manipulating the layer stack and the contained layers.
*/
export class LayerStack {
	protected _stack: List<Layer> = List<Layer>();

	public get stack() { return this._stack; }


	public first() {
		return this._stack.first();
	}

	public last() {
		return this._stack.last();
	}

	public count() {
		return this._stack.count();
	}

	public get(index: number) {
		console.assert(index > 0);
		console.assert(index < this.count());
		return this._stack.get(index);
	}


	/*
		Add a Layer at the specified index
	*/
	public newLayer(renderer: Renderer, index: number) {
		console.assert(index >= 0);
		console.info("new layer");
		const texture = new Texture(renderer, renderer.getCanvasSize());
		const layer = Layer.create(new Sprite(texture), null, true);
		this._stack = this._stack.insert(index, layer);

		Settings.layers.stack.broadcast(this._stack);
	}


	/*
		Move a layer to a different index
	*/
	public moveLayerToIdx(fromIndex: number, toIndex: number) {
		console.assert(fromIndex !== toIndex);
		console.assert(fromIndex >= 0);
		console.assert(fromIndex < this._stack.count());
		console.assert(toIndex >= 0);
		console.assert(toIndex < this._stack.count());
		
		
		const layer = this._stack.get(fromIndex);
		const tmpStack = this._stack.remove(fromIndex);
		if (fromIndex > toIndex) {
			fromIndex++;
		}
		this._stack = tmpStack.insert(fromIndex, layer);
		
		Settings.layers.stack.broadcast(this._stack);
	}


	/*
		Remove and return a layer from the stack
	*/
	public removeLayer(index: number) {
		console.assert(index >= 0);
		this._stack = this._stack.remove(index);
		
		Settings.layers.stack.broadcast(this._stack);
	}


	/*
		Insert a layer back into the stack after it's been removed (undo/redo)
	*/
	public insertLayer(layer: Layer, index: number) {
		console.assert(layer != null);
		console.assert(index >= 0);

		this._stack.insert(index, layer);
		
		Settings.layers.stack.broadcast(this._stack);
	}

	public replace(layer: Layer, newLayer: Layer) {
		const index = this._stack.indexOf(layer)
		this._stack.set(index, newLayer);
		
		Settings.layers.stack.broadcast(this._stack);
	}
}