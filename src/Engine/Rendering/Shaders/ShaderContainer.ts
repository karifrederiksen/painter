
import { DefaultBrushShader } from "./DefaultBrushShader";
import { DrawPointShader } from "./DrawPointShader";
import { SpriteShader } from "./SpriteShader";
import { OutputShader } from "./OutputShader";
import { Renderer } from "../Renderer";
import { Vec2 } from "../../Math/Vec";
import * as Settings from "../../Global/Settings";

export class ShaderContainer {
	public readonly brushShader: DefaultBrushShader;
	public readonly drawPointShader: DrawPointShader;
	public readonly spriteShader: SpriteShader;
	public readonly outputShader: OutputShader;

	constructor(renderer: Renderer) {
		// init default shaders
		this.brushShader = new DefaultBrushShader(renderer, Settings.getValue(Settings.ID.BrushSoftness), Settings.getValue(Settings.ID.Gamma) );
		this.drawPointShader = new DrawPointShader(renderer, null, Settings.getValue(Settings.ID.RenderingMaxDrawPoints));
		this.spriteShader = new SpriteShader(renderer);
		this.outputShader = new OutputShader(renderer, Settings.getValue(Settings.ID.Gamma));

		Settings.subscribe(Settings.ID.Gamma, this._onGammaChanged);
		Settings.subscribe(Settings.ID.BrushSoftness, this._onSoftnessChanged);
		Settings.subscribe(Settings.ID.CanvasWidth, this._onCanvasWidthChanged);
		Settings.subscribe(Settings.ID.CanvasHeight, this._onCanvasHeightChanged);
	}
	

	protected _onSoftnessChanged = (value: number) => 
		this.brushShader.softness = value;
	

	protected _onGammaChanged = (value: number) => {
		this.outputShader.gamma = value;
		this.brushShader.gamma = value;
	}

	protected _onCanvasWidthChanged = (value: number) => 
		this.spriteShader.resolution = this.spriteShader.resolution.withX(value);

	protected _onCanvasHeightChanged = (value: number) => 
		this.spriteShader.resolution = this.spriteShader.resolution.withY(value);
	
}