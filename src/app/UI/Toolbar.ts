module TSPainter {

	export class Toolbar {
		protected _buttonContainer: WrappedSVG;
		protected _background: WrappedSVGRect;
		protected _buttons: WrappedSVGRect[] = [];
		protected _activeButton = -1;

		constructor(parent: SVGElement) {
			this._buttonContainer = new WrappedSVG(parent);
			const container = this._buttonContainer;
			const buttons = this._buttons;
			this._background = new WrappedSVGRect(container);

			// Dummy buttons
			buttons.push(new WrappedSVGRect(container));
			buttons.push(new WrappedSVGRect(container));
			buttons.push(new WrappedSVGRect(container));
			buttons.push(new WrappedSVGRect(container));
			buttons.push(new WrappedSVGRect(container));
			buttons.push(new WrappedSVGRect(container));
			buttons.push(new WrappedSVGRect(container));
			buttons.push(new WrappedSVGRect(container));
			buttons.push(new WrappedSVGRect(container));

			const x = 3;     // Y padding
			const y = 2;     // X padding
			const size = 28; // Width and height. I want to separate them eventually.
			const r = 4;     // Corner radius
			const sw = 1;    // Stroke width

			container.setX(10).setY(100);


			// Set attributes for the background svg
			this._background
				.setArea(sw, sw, x * 2 + size, (y + size) * buttons.length + y)
				.setR(r)
				.addCSSClass("toolBar");


			// Set attributes for all buttons
			for (let i = 0, ilen = buttons.length; i < ilen; i++) {
				buttons[i]
					.setArea(sw + x, sw + y + (y + size) * i, size, size)
					.setR(r)
					.addCSSClass("toolButton")
					.setOnClickCallback(this._buttonCallback);
			}

			// Set an arbitrary number to be active
			this.activateButton(0);
		}

		public get x() { return Number(this._buttonContainer.getX()); }
		public get y() { return Number(this._buttonContainer.getY()); }

		public set x(x: number) { this._buttonContainer.setX(x); }
		public set y(y: number) { this._buttonContainer.setY(y); }


		protected _buttonCallback = (button: WrappedSVG, ev: MouseEvent) => {
			this.clicked(button);
		}


		public clicked(button: WrappedSVG) {
			const buttons = this._buttons;
			for (let i = 0, ilen = buttons.length; i < ilen; i++) {
				if (buttons[i] === button && i !== this._activeButton) {
					this.activateButton(i);
				}
			}
		}

		public activateButton(buttonIdx: number) {
			const previous = this._activeButton;
			this._buttons[buttonIdx].addCSSClass("toolButtonActive");
			this._buttons[buttonIdx].removeCSSClass("toolButton");

			if (previous >= 0) {
				this._buttons[previous].removeCSSClass("toolButtonActive");
				this._buttons[previous].addCSSClass("toolButton");
			}
			this._activeButton = buttonIdx;
		}
	}
}