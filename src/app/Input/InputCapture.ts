module TSPainter {
    export class InputCapture {
        protected readonly _canvas: HTMLCanvasElement;
		protected readonly _canvasPos = new Vec2();
		protected readonly _data = new InputData();

		protected _mouseDown = false;

        constructor(canvas: HTMLCanvasElement) {
            this._canvas = canvas;
            this.updateCanvasPosition();

            // TODO: event registration should be moved out of this class I think
            document.body.addEventListener("pointerdown", this._onPointerDown);
            document.body.addEventListener("pointermove", this._onPointerMove);
            document.body.addEventListener("pointerup", this._onPointerUp);
        }
        

		protected addMousePosition(ev: PointerEvent, inputType: InputType, interf: InputSource) {
			const data = this._data;
            const x = ev.clientX - this._canvasPos.x;
            const y = ev.clientY - this._canvasPos.y;

			data.source = interf;
			data.type = inputType;
			data.setMods(ev.shiftKey, ev.altKey, ev.ctrlKey);
			data.xy(x, y);
			if (ev.pointerType != "mouse") {
				data.pressure = ev.pressure;
			}
			else {
				data.pressure = 1;
			}
        }


        protected updateCanvasPosition() {
            const bounds = this._canvas.getBoundingClientRect();
            this._canvasPos.xy(bounds.left, bounds.top);
        }


		protected _onPointerDown = (ev: PointerEvent) => {
			console.log(ev.pointerType, ev.pressure)
			this._mouseDown = true;
			this.addMousePosition(ev, InputType.Down, InputSource.Pointer);
			Events.broadcast(Events.ID.PointerDown, this._data);
        }


        protected _onPointerMove = (ev: PointerEvent) => {
			this.addMousePosition(ev, InputType.Move, InputSource.Pointer);
			Events.broadcast(Events.ID.PointerMove, this._data);

			if (this._mouseDown === true) {
				Events.broadcast(Events.ID.PointerDrag, this._data);
			}
        }


		protected _onPointerUp = (ev: PointerEvent) => {
			this._mouseDown = false;
			this.addMousePosition(ev, InputType.Up, InputSource.Pointer);
			Events.broadcast(Events.ID.PointerUp, this._data);
		}
    }
}