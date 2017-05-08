import { Events } from "../Global/Events";
import { InputType, InputData, InputSource, PointerData, InputMods } from "./InputData";
import { Vec2 } from "../Math/Vec";

export class InputCapture {
	protected readonly _canvas: HTMLCanvasElement;

	protected _mouseDown = false;

	constructor(canvas: HTMLCanvasElement) {
		this._canvas = canvas;

		// TODO: event registration should be moved out of this class I think
		canvas.addEventListener("pointerdown", this._onPointerDown);
		document.body.addEventListener("pointermove", this._onPointerMove);
		document.body.addEventListener("pointerup", this._onPointerUp);
	}
	

	protected getInputData(ev: PointerEvent, inputType: InputType, src: InputSource): InputData {
		const bounds = this._canvas.getBoundingClientRect();
		const x = ev.clientX - bounds.left;
		const y = ev.clientY - bounds.top;


		let positionData: PointerData;
		if (ev.pointerType !== "mouse") {
			positionData = new PointerData(
				Vec2.create(x, y),
				ev.pressure,
				Vec2.create(ev.tiltX, ev.tiltY)
			);
		}
		else {
			positionData = new PointerData(
				Vec2.create(x, y),
				1,
				Vec2.create(0, 0)
			);
		}

		const mods = new InputMods(
			ev.shiftKey,
			ev.altKey,
			ev.ctrlKey
		);

		return new InputData(
			src,
			ev.which,
			inputType,
			mods,
			positionData
		);
	}


	protected _onPointerDown = (ev: PointerEvent) => {
		if (ev.button !== 0) {
			return;
		}
		this._mouseDown = true;
		const data = this.getInputData(ev, InputType.Down, InputSource.Pointer);
		Events.pointer.down.broadcast(data);
	}


	protected _onPointerMove = (ev: PointerEvent) => {
		const data = this.getInputData(ev, InputType.Move, InputSource.Pointer);
		Events.pointer.move.broadcast(data);

		if (this._mouseDown === true) {
			const dragdata = this.getInputData(ev, InputType.Drag, InputSource.Pointer);
			Events.pointer.drag.broadcast(dragdata);
		}
	}


	protected _onPointerUp = (ev: PointerEvent) => {
		this._mouseDown = false;
		const data = this.getInputData(ev, InputType.Up, InputSource.Pointer);
		Events.pointer.up.broadcast(data);
	}
}
