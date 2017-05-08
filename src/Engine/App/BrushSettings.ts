import { Hsv, Hsva } from "../Math/Color";
import { Vec2 } from "../Math/Vec";
import { isNumberType } from "../Common";
import { clamp, expostep } from "../Math/Utils";

import { Stack } from "immutable";


// if both color and colorsSwapped are specified: swap colors first, then set new primary.
export interface BrushSettingsArgs {
	readonly primaryColor?: Hsv,
	readonly secondaryColor?: Hsv,
	readonly density?: number,
	readonly spacing?: number,
	readonly size?: number,
	readonly softness?: number,
	readonly textureSize?: Vec2
}

export class BrushSettings {
	constructor(
		public readonly primaryColor: Hsv,
		public readonly secondaryColor: Hsv,
		public readonly density: number,
		public readonly spacing: number,
		public readonly size: number,
		public readonly softness: number,
		public readonly textureSize: Vec2
	) {
		Object.freeze(this);
	}

	public set(newSettings: BrushSettingsArgs) {
		return new BrushSettings(
			newSettings.primaryColor	!= null ? newSettings.primaryColor		: this.primaryColor,
			newSettings.secondaryColor	!= null ? newSettings.secondaryColor	: this.secondaryColor,
			newSettings.density			!= null ? newSettings.density			: this.density,
			newSettings.spacing			!= null ? newSettings.spacing			: this.spacing,
			newSettings.size			!= null ? newSettings.size				: this.size,
			newSettings.softness		!= null ? newSettings.softness			: this.softness,
			newSettings.textureSize		!= null ? newSettings.textureSize		: this.textureSize,
		);
	}
}

export function getScale(settings: BrushSettings) {
	return settings.textureSize.x / settings.size;
}

export function getSpacingPx(settings: BrushSettings) {
	return settings.spacing / settings.size;
}

export function getAlpha(settings: BrushSettings) {
	return densityToAlpha(settings.density);
}

/* 
	Rescale alpha so that it look more linear.

	Reason:
	In Photoshop the value for flow is directly tied to alpha without rescaling, and consequentially 
	you can make massive changes in the high end without making the Brush stroke look any different, 
	but if you make a small change in the low end, the stroke becomes much more transparent.

	I want to avoid this and instead have a setting that works similar to density in Paint Tool Sai,
	which is basically flow, but rescaled.
*/
export function densityToAlpha(alpha: number) {
	alpha = clamp(alpha, .01, 1);
	return alpha * .5 + expostep(alpha) * .5;
	
}

export function mergeBrushArgs(first: BrushSettingsArgs, second: BrushSettingsArgs): BrushSettingsArgs {
	return {
		primaryColor:	second.primaryColor		!= null ? second.primaryColor	: first.primaryColor,
		secondaryColor:	second.secondaryColor	!= null ? second.secondaryColor	: first.secondaryColor,
		density:		second.density			!= null ? second.density		: first.density,
		spacing:		second.spacing			!= null ? second.spacing		: first.spacing,
		size:			second.size 			!= null ? second.size			: first.size,
		softness:		second.softness			!= null ? second.softness		: first.softness,
		textureSize:	second.textureSize		!= null ? second.textureSize	: first.textureSize,
	}
}


export interface SettingsChangeType {
	"BrushColor": Hsv,
	"BrushColorSwap": Hsv,
	"BrushDensity": number,
	"BrushSpacing": number,
	"BrushSize": number,
	"BrushSoftness": number,
	"BrushTextureSize": Vec2
}

export type SettingsChangeTypeKey = keyof SettingsChangeType;

export class SettingsChangeEvent {
	constructor(
		public readonly type: SettingsChangeTypeKey,
		public readonly value: SettingsChangeType[SettingsChangeTypeKey]
	) {
		console.assert(type != null, `Type is ${type}`);
		console.assert(value != null, `Value is ${value}`);
		Object.freeze(this);
	}
}

export class BrushSettingsChangeResult {
	constructor(
		public readonly settings: BrushSettings,
		public readonly changeEvents: Stack<SettingsChangeEvent>
	) {
		Object.freeze(this);
	}
}


export function handleBrushSettingsChange(input: BrushSettingsChangeResult): BrushSettingsChangeResult {
	const settings = input.settings;
	const events = input.changeEvents;
	const event = events.first();
	const nextStack = events.shift();

	let newSettings: BrushSettings;
	switch(event.type) {
		case "BrushColor": 
		newSettings = settings.set({ primaryColor: <Hsv>event.value });
		break;
		case "BrushColorSwap": 
		newSettings = settings.set({
			primaryColor: settings.secondaryColor,
			secondaryColor: settings.primaryColor
		});
		break;
		case "BrushDensity": 
		newSettings = settings.set({ density: <number>event.value });
		break;
		case "BrushSpacing": 
		newSettings = settings.set({ spacing: <number>event.value });
		break;
		case "BrushSize": 
		newSettings = settings.set({ size: <number>event.value });
		break;
		case "BrushSoftness": 
		newSettings = settings.set({ softness: <number>event.value });
		break;
		case "BrushTextureSize": 
		newSettings = settings.set({ textureSize: <Vec2>event.value });
		break;
		default: 
		console.error(`handleSettingsChange unhandled event type: ${event.type}`);
		newSettings = settings;
		break;
	}
	return new BrushSettingsChangeResult(newSettings, nextStack);
}

export function handleAllBrushSettingsEvents(settings: BrushSettings, events: Stack<SettingsChangeEvent>) {
	let res = new BrushSettingsChangeResult(settings, events);
	while (res.changeEvents.count() > 0) {
		res = handleBrushSettingsChange(res);
	}
	return res.settings;
}