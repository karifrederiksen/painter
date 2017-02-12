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
		checkForIdNone(id);
		return _settings[id] != null ? _settings[id].value : null;
	}


	/*
		Subscribe to a setting with a callback
	*/
	export function subscribe(id: number, callback: Callback) {
		checkForIdNone(id);
		let setting = _settings[id];
		if (setting == null) {
			setting = new Setting(id, null);
			_settings[id] = setting;
		}
		setting.callbacks.push(callback);
	}


	/*
		Remove a callback from the callback list for a specific event
	*/
	export function unsubscribe(id: ID, callback: Callback) {
		checkForIdNone(id);
		const idx = _settings[id].callbacks.indexOf(callback);
		if (idx >= 0) {
			_settings[id].callbacks.splice(idx, 1);
		}
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
		For debugging
	*/
	function checkForIdNone(id: ID) {
		if (id === ID.None) {
			console.warn("Settings.ID.None used");
		}
	}

	/*
		Define the names of all settings
	*/
	export enum ID {
		None,

		// display
		CanvasWidth,
		CanvasHeight,
		Gamma,

		// tool change
		ToolId,

		// brush
		BrushTextureSize,
		BrushSize,
		BrushSoftness,
		BrushSpacing,
		BrushDensity,
		BrushHue,
		BrushSaturation,
		BrushValue,

		// rendering
		RenderingMaxDrawPoints,
		RenderingBlendMode,
	}
}