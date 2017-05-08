import { Events } from "../Global/Events";
import { Settings } from "../Global/Settings";
import { Texture } from "../Rendering/Texture";
import { Renderer } from "../Rendering/Renderer";
import { generateBrushTexture } from "../Rendering/TextureGenerator";
import { Rgba, Hsv, Hsva, ColorWithAlpha } from "../Math/Color";
import { InputData, InputSource, InputType } from "../Input/InputData";
import { Vec2 } from "../Math/Vec";
import { BrushSettings, densityToAlpha } from "./BrushSettings";
import { isNumberType } from "../Common";
import { Tool } from "./Tools";


export class BrushTool {
	protected readonly _texture: Texture;
	protected _settings: BrushSettings;


	public get settings() { return this._settings; }
	public get texture() { return this._texture; }


	constructor(renderer: Renderer, settings: BrushSettings) {
		console.assert(renderer != null);
		this._settings = settings;
		this._texture = new Texture(renderer, settings.textureSize);
		this.update(renderer, settings);
	}


	public update(renderer: Renderer, settings: BrushSettings) {
		this._settings = settings;
		this._texture.size = settings.textureSize;
		// updating size deletes a layer - some issue with texture binding
		//this._texture.updateSize(renderer);
		generateBrushTexture(renderer, this._texture);
	}
}