import * as Events from "../Global/Events";
import { InputType, InputData, InputSource, InputPositionData, InputMods } from "./InputData";
import { Vec2 } from "../Math/Vec2";

export class InputCapture {
	protected readonly _canvas: HTMLCanvasElement;
	protected _canvasPos: Vec2;

	protected _mouseDown = false;

	constructor(canvas: HTMLCanvasElement) {
		this._canvas = canvas;
		this.updateCanvasPosition();

		// TODO: event registration should be moved out of this class I think
		canvas.addEventListener("pointerdown", this._onPointerDown);
		document.body.addEventListener("pointermove", this._onPointerMove);
		document.body.addEventListener("pointerup", this._onPointerUp);

		canvas.addEventListener("resize", () => this.updateCanvasPosition());
		canvas.addEventListener("reposition", () => this.updateCanvasPosition());
		window.addEventListener("scroll", () => this.updateCanvasPosition());
	}
	

	protected getInputData(ev: PointerEvent, inputType: InputType, src: InputSource): InputData {
		const x = ev.clientX - this._canvasPos.x;
		const y = ev.clientY - this._canvasPos.y;


		let positionData: InputPositionData;
		if (ev.pointerType !== "mouse") {
			positionData = new InputPositionData(
				Vec2.create(x, y),
				ev.pressure,
				Vec2.create(ev.tiltX, ev.tiltY)
			);
		}
		else {
			positionData = new InputPositionData(
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


	protected updateCanvasPosition() {
		const bounds = this._canvas.getBoundingClientRect();
		this._canvasPos = Vec2.create(bounds.left, bounds.top);
	}


	protected _onPointerDown = (ev: PointerEvent) => {
		if (ev.button !== 0) {
			return;
		}
		this._mouseDown = true;
		const data = this.getInputData(ev, InputType.Down, InputSource.Pointer);
		Events.broadcast(Events.ID.PointerDown, data);
	}


	protected _onPointerMove = (ev: PointerEvent) => {
		const data = this.getInputData(ev, InputType.Move, InputSource.Pointer);
		Events.broadcast(Events.ID.PointerMove, data);

		if (this._mouseDown === true) {
			Events.broadcast(Events.ID.PointerDrag, data);
		}
	}


	protected _onPointerUp = (ev: PointerEvent) => {
		this._mouseDown = false;
		const data = this.getInputData(ev, InputType.Up, InputSource.Pointer);
		Events.broadcast(Events.ID.PointerUp, data);
	}
}
