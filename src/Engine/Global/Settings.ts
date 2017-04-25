import { Fun1 } from "../Common";
import { Vec2 } from "../Math/Vec";
import { Hsva } from "../Math/Color";
import { Tools } from "../../Tools";
import { BlendModeType } from "../Rendering/Consts";
import { Layer, LayerBasic } from "../Rendering/Layers/Layer";
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

const Layers = {
	current: new Setting<LayerBasic>(),
	stack: new Setting<Iterable<number, LayerBasic>>()
}

export const Settings = {
	brush: BrushSettings,
	rendering: RenderSettings,
	layers: Layers,
	toolId: new Setting<Tools>()
}
