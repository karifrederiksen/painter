
import { Fun1 } from "../Common";
import { Hsva } from "../Math/Color";
import { Tools } from "../../Tools";
import { InputData } from "../Input/InputData";
import { Stack } from "immutable";

/*
	Global object for handling events. I don't yet know how extensively it will be used.

	This event module broadcasts events immediately, as opposed to storing them for later use.
*/

export class Event<T> {
	private _callbacks: Stack<Fun1<T, void>> = Stack<Fun1<T, void>>();

	public subscribe(callback: Fun1<T, void>) {
		const cbs = this._callbacks;
		if (cbs.every((val) => val !== callback)) {
			this._callbacks = cbs.push(callback);
		}
	}

	public unsubscribe(callback: Fun1<T, void>) {
		this._callbacks = this._callbacks
			.filter((val) => val !== callback)
			.toStack();
	}

	public broadcast(value: T) {
		this._callbacks.forEach((func) => func(value));
	}
}

const BrushEvents = {
	color: new Event<Hsva>(),
	density: new Event<number>(),
	softness: new Event<number>(),
	spacing: new Event<number>(),
	size: new Event<number>(),
};

const Pointer = {
	down: new Event<InputData>(),
	up: new Event<InputData>(),
	move: new Event<InputData>(),
	drag: new Event<InputData>()
}

export const Events = {
	brush: BrushEvents,
	pointer: Pointer,
	tool: new Event<Tools>()
}