
import { Layer } from "./Layer";
import { LayerCombiner } from "./LayersCombiner";
import { Renderer } from "../Renderer";
import { Texture } from "../Texture";
import { Sprite } from "../Sprite";
import { Vec2 } from "../../Math/Vec";
import { List } from "immutable";

/*
	Contains the layer stack.
	
	The bottom of the stack is at index 0. Top is at layerStack.length-1.
	Layers will be rendered in the stack's order.

	Used for manipulating the layer stack and the contained layers.
*/
export class LayerStack {
	public stack: List<Layer> = List<Layer>();

	/*
		Add a Layer at the specified index
	*/
	public newLayer(renderer: Renderer, index: number) {
		console.assert(index >= 0);
		const texture = new Texture(renderer, renderer.getCanvasSize());
		const layer = Layer.create(new Sprite(texture), null, true);
		this.stack.insert(index, layer);
	}


	/*
		Move a layer to a different index
	*/
	public moveLayerToIdx(fromIndex: number, toIndex: number) {
		console.assert(fromIndex !== toIndex);
		console.assert(fromIndex >= 0);
		console.assert(fromIndex < this.stack.count());
		console.assert(toIndex >= 0);
		console.assert(toIndex < this.stack.count());
		
		
		const layer = this.stack.get(fromIndex);
		const tmpStack = this.stack.remove(fromIndex);
		if (fromIndex > toIndex) {
			fromIndex++;
		}
		this.stack = this.stack.insert(fromIndex, layer);
	}


	/*
		Remove and return a layer from the stack
	*/
	public removeLayer(index: number) {
		console.assert(index >= 0);
		this.stack = this.stack.remove(index);
	}


	/*
		Insert a layer back into the stack after it's been removed (undo/redo)
	*/
	public insertLayer(layer: Layer, index: number) {
		console.assert(layer != null);
		console.assert(index >= 0);

		this.stack.insert(index, layer);
	}

	public replace(layer: Layer, newLayer: Layer) {
		const index = this.stack.indexOf(layer)
		this.stack.set(index, newLayer);
	}

	public first() {
		return this.stack.first();
	}
}