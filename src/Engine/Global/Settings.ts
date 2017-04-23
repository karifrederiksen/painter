import { Fun1 } from "../Common";
import { Vec2 } from "../Math/Vec";
import { Hsva } from "../Math/Color";
import { Tools } from "../../Tools";
import { BlendModeType } from "../Rendering/Consts";

export class Setting<T> {
	private _callbacks: Fun1<T, void>[] = [];
	private _value: T;

	public get value() { return this._value; }

	public subscribe(callback: Fun1<T, void>) {
		const cbs = this._callbacks;
		if (cbs.every((val) => val !== callback)) {
			cbs.push(callback);
		}
	}

	public unsubscribe(callback: Fun1<T, void>) {
		const cbs = this._callbacks;
		const idx = cbs.findIndex((value) => value === callback);
		if (idx > -1) {
			cbs.splice(idx, 1);
		}
	}

	public broadcast(value: T) {
		const cbs = this._callbacks;
		for (let func of cbs) {
			func(value);
		}
		this._value = value;
	}
}


const BrushSettings = {
	textureSize: new Setting<Vec2>(),
	size: new Setting<number>(),
	softness: new Setting<number>(),
	spacing: new Setting<number>(),
	density: new Setting<number>(),
	color: new Setting<Hsva>()
}

const RenderSettings = {
	canvasSize: new Setting<Vec2>(),
	gamma: new Setting<number>(),
	blendMode: new Setting<BlendModeType>(),
	maxDrawPoints: new Setting<number>()
}

export const Settings = {
	brush: BrushSettings,
	rendering: RenderSettings,
	toolId: new Setting<Tools>()
}
