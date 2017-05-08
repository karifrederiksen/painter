import { Hsv, Hsva } from "../Math/Color";
import { Vec2 } from "../Math/Vec";
import { BrushSettings } from "BrushSettings";

import { Stack } from "immutable";


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
	type: SettingsChangeTypeKey;
	value: SettingsChangeType[SettingsChangeTypeKey];
}


export class SettingsChangeResult {
	constructor(
		public readonly settings: BrushSettings,
		public readonly changeEvents: Stack<SettingsChangeEvent>
	) {
		Object.freeze(this);
	}
}


export function handleSettingsChange(input: SettingsChangeResult): SettingsChangeResult {
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
	return new SettingsChangeResult(newSettings, nextStack);
}


export function handleAllSettingsEvents(settings: BrushSettings, events: Stack<SettingsChangeEvent>) {
	let res = new SettingsChangeResult(settings, events);
	while (res.changeEvents.count() > 0) {
		res = handleSettingsChange(res);
	}
	return res.settings;
}