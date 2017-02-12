///<reference path="Layer.ts"/>

module TSPainter.Rendering {
	/*
		Contains the layer stack.
		
		The bottom of the stack is at index 0. Top is at layerStack.length-1.
		Layers will be rendered in the stack's order.

		Used for manipulating the layer stack and the contained layers.
	*/
	export class LayerStack {
		protected _nextLayerId = 0;
		protected _renderer: Renderer;

		public stack: Layer[] = [];

		constructor(renderer: Renderer) {
			this._renderer = renderer;
		}

		/*
			Add a Layer at the specified index
		*/
		public newLayer(index: number) {
			const texture = new Texture(this._renderer);
			const layer = new Layer(texture, this._nextLayerId++);
			this.stack.splice(index, 0, layer);
		}


		/*
			Move a layer to a different index
		*/
		public moveLayerToIdx(fromIndex: number, toIndex: number) {
			this.stack.move(fromIndex, toIndex);
		}


		/*
			Remove and return a layer from the stack
		*/
		public removeLayer(index: number) {
			return this.stack.splice(index, 1)[0];
		}


		/*
			Insert a layer back into the stack after it's been removed (undo/redo)
		*/
		public insertLayer(layer: Layer, idx: number) {
			this.stack.splice(idx, 0, layer);
		}
	}
}