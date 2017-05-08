import { Fun1 } from "../Common";
import { Vec2 } from "../Math/Vec";
import { Hsva } from "../Math/Color";
import { ToolType } from "../App/Tools";
import { BlendModeType } from "../Rendering/Consts";
import { Layer } from "../Rendering/Layers/Layer";
import { BrushSettings } from "../App/BrushSettings";
import { Stack, Iterable } from "immutable";

export class Setting<T> {
	private _callbacks: Stack<Fun1<T, void>> = Stack<Fun1<T, void>>();
	private _value: T;

	public get value() { return this._value; }

	public subscribe(callback: Fun1<T, void>) {
		if (this._callbacks.every((val) => val !== callback)) {
			this._callbacks = this._callbacks.push(callback);
		}
	}

	public unsubscribe(callback: Fun1<T, void>) {
		this._callbacks = this._callbacks
			.filter((val) => val !== callback)
			.toStack();
	}

	public broadcast(value: T) {
		this._callbacks.forEach((func) => func(value));
		this._value = value;
	}
}


const RenderSettings = {
	canvasSize: new Setting<Vec2>(),
	gamma: new Setting<number>(),
	blendMode: new Setting<BlendModeType>(),
	maxDrawPoints: new Setting<number>()
}

const Layers = {
	current: new Setting<Layer>(),
	stack: new Setting<Iterable<number, Layer>>()
}

export const Settings = {
	brush: new Setting<BrushSettings>(),
	rendering: RenderSettings,
	layers: Layers,
	toolId: new Setting<ToolType>()
}
