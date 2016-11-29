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
            document.addEventListener("mousedown", this._onMouseDown);
            document.addEventListener("mousemove", this._onMouseMove);
            document.addEventListener("mouseup", this._onMouseUp);
        }
        

		protected addMousePosition(ev: MouseEvent, inputType: InputType, interf: InputInterface) {
			const data = this._data;
            const x = ev.clientX - this._canvasPos.x;
            const y = ev.clientY - this._canvasPos.y;

			data.interf = interf;
			data.type = inputType;
			data.setMods(ev.shiftKey, ev.altKey, ev.ctrlKey);
			data.xy(x, y);
        }


        protected updateCanvasPosition() {
            const bounds = this._canvas.getBoundingClientRect();
            this._canvasPos.xy(bounds.left, bounds.top);
        }


		protected _onMouseDown = (ev: MouseEvent) => {
			this._mouseDown = true;
			this.addMousePosition(ev, InputType.Down, InputInterface.Mouse);
			Event.broadcast(Event.ID.MOUSE_DOWN, this._data);
        }


        protected _onMouseMove = (ev: MouseEvent) => {
			this.addMousePosition(ev, InputType.Move, InputInterface.Mouse);
			Event.broadcast(Event.ID.MOUSE_MOVE, this._data);

			if (this._mouseDown === true) {
				Event.broadcast(Event.ID.MOUSE_DRAG, this._data);
			}
        }


		protected _onMouseUp = (ev: MouseEvent) => {
			this._mouseDown = false;
			this.addMousePosition(ev, InputType.Up, InputInterface.Mouse);
			Event.broadcast(Event.ID.MOUSE_UP, this._data);
		}
    }
}