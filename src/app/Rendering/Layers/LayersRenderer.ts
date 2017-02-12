///<reference path="LayerStack.ts"/>
///<reference path="../Renderer.ts"/>

module TSPainter.Rendering {
	/*
		Renders all the layers in the LayerStack onto a single Texture
	*/
	export class LayersRenderer {
		protected _renderer: Renderer;
		protected _layerStack: LayerStack;
		protected _currentLayer: Layer = null;

		public combinedLayers: Sprite;

		constructor(renderer: Renderer, layerStack: LayerStack) {
			this._renderer = renderer;
			this._layerStack = layerStack;
			this.combinedLayers = new Sprite(new Texture(renderer, renderer.canvas.width, renderer.canvas.height));
		}


		public renderLayers(currentLayer: Layer) {
			const renderer = this._renderer;
			
			renderer.blendMode = BlendMode.Normal;
			renderer.renderSpriteToTexture(this._layerStack.stack[0], this.combinedLayers.texture, null);
		}
	}
}