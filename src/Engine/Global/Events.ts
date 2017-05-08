
import { Fun1 } from "../Common";
import { ToolType } from "../App/Tools";
import { InputData } from "../Input/InputData";
import { Layer } from "../Rendering/Layers/Layer";
import { Stack } from "immutable";

/*
	Global object for handling events. I don't yet know how extensively it will be used.

	This event module broadcasts events immediately, as opposed to storing them for later use.
*/

export class Event<T> {
	private _callbacks = Stack<Fun1<T, void>>().asMutable();

	constructor() {
		Object.freeze(this);
	}

	public subscribe(callback: Fun1<T, void>) {
		const cbs = this._callbacks;
		if (cbs.every((val) => val !== callback)) {
			this._callbacks.asMutable().push(callback);
		}
	}

	public unsubscribe(callback: Fun1<T, void>) {
		this._callbacks
			.asMutable()
			.filter((val) => val !== callback)
			.toStack();
	}

	public broadcast(value: T) {
		this._callbacks.forEach((func) => func(value));
	}
}


export const Events = Object.freeze({
	pointer: Object.freeze({
		down: new Event<InputData>(),
		up: new Event<InputData>(),
		move: new Event<InputData>(),
		drag: new Event<InputData>()
	}),
	layer: Object.freeze({
		select: new Event<Layer>(),
		moveUp: new Event<Layer>(),
		moveDown: new Event<Layer>(),
		toggleVisible: new Event<Layer>(),
		create: new Event(),
		delete: new Event<Layer>()

	}),
	tool: new Event<ToolType>()
});