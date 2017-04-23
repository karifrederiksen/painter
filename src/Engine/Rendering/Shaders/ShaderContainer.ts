
import { DefaultBrushShader } from "./DefaultBrushShader";
import { DrawPointShader } from "./DrawPointShader";
import { SpriteShader } from "./SpriteShader";
import { OutputShader } from "./OutputShader";
import { Renderer } from "../Renderer";
import { Vec2 } from "../../Math/Vec";
import { Settings } from "../../Global/Settings";

export class ShaderContainer {
	public readonly brushShader: DefaultBrushShader;
	public readonly drawPointShader: DrawPointShader;
	public readonly spriteShader: SpriteShader;
	public readonly outputShader: OutputShader;

	constructor(renderer: Renderer) {
		// init default shaders
		this.brushShader = new DefaultBrushShader(renderer, Settings.brush.softness.value, Settings.rendering.gamma.value);
		this.drawPointShader = new DrawPointShader(renderer, null, Settings.rendering.maxDrawPoints.value);
		this.spriteShader = new SpriteShader(renderer);
		this.outputShader = new OutputShader(renderer, Settings.rendering.gamma.value);

		Settings.rendering.gamma.subscribe(this._onGammaChanged);
		Settings.brush.softness.subscribe(this._onSoftnessChanged);
		Settings.rendering.canvasSize.subscribe(this._onCanvasWidthChanged);
	}
	

	protected _onSoftnessChanged = (value: number) => 
		this.brushShader.softness = value;
	

	protected _onGammaChanged = (value: number) => {
		this.outputShader.gamma = value;
		this.brushShader.gamma = value;
	}

	protected _onCanvasWidthChanged = (value: Vec2) => 
		this.spriteShader.resolution = value;
}