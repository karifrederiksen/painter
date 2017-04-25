﻿
import { DefaultBrushShader } from "./DefaultBrushShader";
import { DrawPointShader } from "./DrawPointShader";
import { SpriteShader } from "./SpriteShader";
import { OutputShader } from "./OutputShader";
import { BackgroundShader } from "./BackgroundShader";
import { Renderer } from "../Renderer";
import { Vec2 } from "../../Math/Vec";
import { Settings } from "../../Global/Settings";

export class ShaderContainer {
	public readonly brushShader: DefaultBrushShader;
	public readonly drawPointShader: DrawPointShader;
	public readonly spriteShader: SpriteShader;
	public readonly outputShader: OutputShader;
	public readonly backgroundShader: BackgroundShader;

	constructor(renderer: Renderer) {
		const resolution = renderer.getCanvasSize();

		// init default shaders
		this.brushShader = new DefaultBrushShader(renderer, Settings.brush.softness.value, Settings.rendering.gamma.value);
		this.drawPointShader = new DrawPointShader(renderer, resolution, Settings.rendering.maxDrawPoints.value);
		this.spriteShader = new SpriteShader(renderer, resolution);
		this.outputShader = new OutputShader(renderer, resolution, Settings.rendering.gamma.value);
		this.backgroundShader = new BackgroundShader(renderer, resolution);

		Settings.rendering.gamma.subscribe(this._onGammaChanged);
		Settings.brush.softness.subscribe(this._onSoftnessChanged);
		Settings.rendering.canvasSize.subscribe(this._onCanvasSizeChanged);
	}
	

	protected _onSoftnessChanged = (value: number) => 
		this.brushShader.softness = value;
	

	protected _onGammaChanged = (value: number) => {
		this.outputShader.gamma = value;
		this.brushShader.gamma = value;
	}

	protected _onCanvasSizeChanged = (value: Vec2) => {
		this.drawPointShader.resolution = value;
		this.spriteShader.resolution = value;
		this.outputShader.resolution = value;
		this.backgroundShader.resolution = value;
	}
}