/*

*/
module TSPainter.Settings {
	export class Setting {
		constructor(
			public id: number,
			public value: any,
			public callbacks: Callback[] = []
		) {}
	}


	/*
		Object to contain all settings objects
	*/
	const _settings: { [id: number]: Setting } = {};


	/*
		Set a new value for a setting and broadcast it to all subscribers
	*/
	export function setValue(id: number, value: any) {
		let setting = _settings[id];
		if (setting == null) {
			setting = new Setting(id, value);
			_settings[id] = setting;
		}
		else {
			setting.value = value;
		}
		broadcast(setting);
	}


	/*
		Get the current value of a setting
	*/
	export function getValue(id: number) {
		return _settings[id].value;
	}


	/*
		Subscribe to a setting with a callback
	*/
	export function subscribe(id: number, callback: Callback) {
		let setting = _settings[id];
		if (setting == null) {
			setting = new Setting(id, null);
			_settings[id] = setting;
		}
		setting.callbacks.push(callback);
	}


	/*
		Broadcast a value change to all callbacks
	*/
	function broadcast(setting: Setting) {
		const callbacks = setting.callbacks;
		const value = setting.value;
		for (let i = 0, ilen = callbacks.length; i < ilen; i++) {
			callbacks[i](value);
		}
	}


	/*
		Define the names of all settings
	*/
	export enum ID {
		// display
		CanvasWidth,
		CanvasHeight,
		Gamma,

		// brush
		BrushSize,
		BrushSoftness,
		BrushPointSpacing,
		BrushHue,
		BrushSaturation,
		BrushValue,
		BrushAlpha,

		// rendering
		RenderingMaxDrawPoints,
		RenderingBlendMode,
	}
}