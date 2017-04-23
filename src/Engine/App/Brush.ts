import { Events } from "../Global/Events";
import { Settings } from "../Global/Settings";
import { Texture } from "../Rendering/Texture";
import { Renderer } from "../Rendering/Renderer";
import { generateBrushTexture } from "../Rendering/TextureGenerator";
import { Hsv, Hsva, ColorWithAlpha } from "../Math/Color";
import { clamp, expostep } from "../Math/Utils";
import { isNumberType } from "../Common";

function subscribeToBrushEvents(brush: Brush) {
	Events.brush.color.subscribe(brush.setColor);
	Events.brush.density.subscribe(brush.setDensity);
	Events.brush.softness.subscribe(brush.setSoftness);
	Events.brush.spacing.subscribe(brush.setSpacing);
	Events.brush.size.subscribe(brush.setSize);
}


export class Brush {
	protected _renderer: Renderer;
	protected _texture: Texture;
	protected _color: Hsva;
	protected _spacing = Settings.brush.spacing.value;
	protected _size = Settings.brush.size.value;
	protected _softness = Settings.brush.softness.value;


	constructor(renderer: Renderer) {
		console.assert(renderer != null);
		this._renderer = renderer;
		const bTexSize = Settings.brush.textureSize.value.x;
		this._texture = new Texture(renderer, bTexSize, bTexSize);
		generateBrushTexture(renderer, this._texture);

		const hsva = Settings.brush.color.value;
		this._color = Hsva.create(
			hsva.h,
			hsva.s,
			hsva.v,
			hsva.a
		);
		this.setDensity(Settings.brush.density.value);
		subscribeToBrushEvents(this);
	}

	public setColor = (color: Hsva) => {
		console.assert(color.isZeroToOne(), `HSVA color has invalid value: ${color}. Expected all values to be in range [0..1]`)
        this._color = color;
		Settings.brush.color.broadcast(color);
	}

	public setTexture(t: Texture) { 
		console.assert(t != null);
		this._texture = t; 
	}

	public setDensity = (value: number) => {
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

		Settings.brush.density.broadcast(value);
		value = clamp(value, .01, 1);
		const adjustedValue = value * .5 + expostep(value) * .5;
		
		this._color = this._color.withA(adjustedValue);
		Settings.brush.color.broadcast(this._color);
	}

	public setSpacing = (value: number) => {
		console.assert(isNumberType(value) === true);
		console.assert(value <= 1 && value > 0);
		this._spacing = value;
		Settings.brush.spacing.broadcast(value);
	}

	public setSoftness = (value: number) => {
		console.assert(isNumberType(value) === true);
		console.assert(value <= 1 && value >= 0);

		// update brush texture

		Settings.brush.softness.broadcast(value);
		generateBrushTexture(this._renderer, this._texture);
	}

	public setSize = (value: number) => {
		console.assert(isNumberType(value) === true);
		console.assert(value > 0);
		this._size = value;
		Settings.brush.size.broadcast(value);
	}


	public getTexture() { 
		return this._texture;
	}

	public getScale() { 
		return this._texture.size.x / this._size;
	}

	public getSpacingPx() { 
		return this._spacing * this._size;
	}

	public getColorRgba () {
		return this._color
			.toRgba()
			.powScalar(Settings.rendering.gamma.value);
	}
}