module TSPainter {
    export class ShaderManager {
        protected readonly _renderer: Renderer;
        public readonly brushShader: DefaultBrushShader;
        public readonly drawPointShader: DrawPointShader;
        public readonly spriteShader: SpriteShader;
        public readonly outputShader: OutputShader;

        constructor(renderer: Renderer) {
            this._renderer = renderer;

			// init default shaders
			this.brushShader = new DefaultBrushShader(renderer, Settings.getValue(Settings.ID.BrushSoftness));
			this.drawPointShader = new DrawPointShader(renderer, null, Settings.getValue(Settings.ID.RenderingMaxDrawPoints));
            this.spriteShader = new SpriteShader(renderer);
			this.outputShader = new OutputShader(renderer, Settings.getValue(Settings.ID.Gamma));

			Settings.subscribe(Settings.ID.Gamma, this._onGammaChanged);
			Settings.subscribe(Settings.ID.CanvasWidth, this._onCnavasWidthChanged);
			Settings.subscribe(Settings.ID.CanvasHeight, this._onCnavasHeightChanged);

			Settings.subscribe(Settings.ID.BrushSoftness, this.brushShader.softnessChangeCallback);
			Settings.subscribe(Settings.ID.Gamma, this.brushShader.gammaChangeCallback);
		}

		protected _onGammaChanged = (value: number) => {
			this.outputShader.setGamma(this._renderer, value);
		}

		protected _onCnavasWidthChanged = (value: number) => {
			this.spriteShader.setCanvasWidth(value);
		}

		protected _onCnavasHeightChanged = (value: number) => {
			this.spriteShader.setCanvasHeight(value);
		}
    }
}