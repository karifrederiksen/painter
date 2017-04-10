import * as Events from "../Global/Events";
import * as Settings from "../Global/Settings";
import { Texture } from "../Rendering/Texture";
import { Renderer } from "../Rendering/Renderer";
import { TextureGenerator } from "../Rendering/TextureGenerators/TextureGenerator";
import { Hsv, Hsva, ColorWithAlpha } from "../Math/Color";
import { clamp, expostep } from "../Math/Utils";
import { isNumberType } from "../Misc/Misc";

function subscribeToBrushEvents(brush: Brush) {
	Events.subscribe(Events.ID.BrushHue,        (value: number) => brush.setHue(value) );
	Events.subscribe(Events.ID.BrushSaturation, (value: number) => brush.setSaturation(value) );
	Events.subscribe(Events.ID.BrushValue,      (value: number) => brush.setValue(value) );
	Events.subscribe(Events.ID.BrushDensity,    (value: number) => brush.setDensity(value) );
	Events.subscribe(Events.ID.BrushSoftness,   (value: number) => brush.setSoftness(value) );
	Events.subscribe(Events.ID.BrushSpacing,    (value: number) => brush.setSpacing(value) );
	Events.subscribe(Events.ID.BrushSize,       (value: number) => brush.setSize(value) );
}


export class Brush {
	protected _texture: Texture;
	protected _color: Hsva;
	protected _spacing = Settings.getValue(Settings.ID.BrushSpacing);
	protected _size = Settings.getValue(Settings.ID.BrushSize);
	protected _softness = Settings.getValue(Settings.ID.BrushSoftness);
	protected _textureGenerator: TextureGenerator;


	constructor(renderer: Renderer) {
		console.assert(renderer != null);
		this._textureGenerator = new TextureGenerator(renderer, renderer.shaders.brushShader);
		const bTexSize = Settings.getValue(Settings.ID.BrushTextureSize);
		this._texture = new Texture(renderer, bTexSize, bTexSize);
		this._textureGenerator.generate(this._texture);

		this._color = Hsva.create(
			Settings.getValue(Settings.ID.BrushHue),
			Settings.getValue(Settings.ID.BrushSaturation),
			Settings.getValue(Settings.ID.BrushValue),
			Settings.getValue(Settings.ID.BrushDensity)
		);
		this.setDensity(Settings.getValue(Settings.ID.BrushDensity));
		subscribeToBrushEvents(this);
	}


	public setHue(value: number) {
		console.assert(isNumberType(value) === true);
		console.assert(value <= 1 && value >= 0);
		Settings.setValue(Settings.ID.BrushHue, value);

		this._color = this._color.withH(value);
	}


	public setSaturation(value: number) {
		console.assert(isNumberType(value) === true);
		console.assert( value <= 1 && value >= 0);
		Settings.setValue(Settings.ID.BrushSaturation, value);

		this._color = this._color.withS(value);
	}

	public setValue(value: number) {
		console.assert(isNumberType(value) === true);
		console.assert( value <= 1 && value >= 0);
		Settings.setValue(Settings.ID.BrushValue, value);
		
		this._color = this._color.withV(value);
	}

	public setTexture(t: Texture) { 
		console.assert(t != null);
		this._texture = t; 
	}

	public setDensity(value: number) {
		/* 
			Rescale alpha so that changes to it look more linear.

			Reason:
			In Photoshop the value for flow is directly tied to alpha without rescaling, and consequentially 
			you can make massive changes in the high end without making the Brush stroke look any different, 
			but if you make a small change in the low end, the stroke becomes much more transparent.

			I want to avoid this and instead have a setting that works similar to density in Paint Tool Sai,
			which is basically flow, but rescaled.
		*/
		console.assert(isNumberType(value) === true);
		console.assert(value <= 1 && value > 0);
		Settings.setValue(Settings.ID.BrushDensity, value);
		value = clamp(value, .01, 1);
		const adjustedValue = value * .1 + expostep(value) * .9;
		
		this._color = this._color.WithA(adjustedValue);
		Settings.setValue(Settings.ID.BrushAlpha, adjustedValue);
	}

	public setSpacing(value: number) {
		console.assert(isNumberType(value) === true);
		console.assert(value <= 1 && value > 0);
		this._spacing = value;
		Settings.setValue(Settings.ID.BrushSpacing, value);
	}

	public setSoftness(value: number) {
		console.assert(isNumberType(value) === true);
		console.assert(value <= 1 && value >= 0);

		// update brush texture

		Settings.setValue(Settings.ID.BrushSoftness, value);
		this._textureGenerator.generate(this._texture);
	}

	public setSize(value: number) {
		console.assert(isNumberType(value) === true);
		console.assert(value > 0);
		this._size = value;
		Settings.setValue(Settings.ID.BrushSize, value);
	}


	public getTexture = () => this._texture; 

	public getScale = () => this._texture.size.x / this._size;

	public getSpacingPx = () => this._spacing * this._size;

	public getColorRgba = () => this._color
		.toRgba()
		.powScalar(Settings.getValue(Settings.ID.Gamma));
}