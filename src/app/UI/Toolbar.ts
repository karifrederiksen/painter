///<reference path="Generics/DisplayObject.ts"/>

module TSPainter.UI {

	export class Toolbar extends DisplayObject {
		protected _container: DisplayObjectContainer;
		protected _buttons: Button[] = [];
		protected _activeButton = -1;

		constructor(parent: DisplayObjectContainer, xPos: number, yPos: number) {
			super(xPos, yPos);
            this.interactable = true;
            this.description = "Toolbar";
			this._container   = new DisplayObjectContainer(new WrappedSVG());
			const buttons     = this._buttons;
			const container   = this._container;
			parent.addChild(container);
			container.addChild(this);

			// Looks
			const buttIds: number[][] = [
				[Events.ID.ButtonToolBrush, Tools.Brush], 
				[Events.ID.ButtonToolEraser, Tools.Eraser], 
				[Events.ID.ButtonToolBlur, Tools.Blur],
			];
			const buttCount = buttIds.length; // Number of buttons
			const xPad = 3;     // Y padding
			const yPad = 2;     // X padding
			const size = 28;    // Width and height. I want to separate them eventually.
			const r = 4;        // Corner radius
			const sw = 1;       // Stroke width
			const tPad = 10;    // Padding on top

			container.x = 10;
			container.y = 100;
			this.width = xPad * 2 + size;
			this.height = tPad + (yPad + size) * buttCount + yPad;
			container.width = this.width + sw * 2;
			container.height = this.height + sw * 2;
			
			// Set attributes for the background svg
			this.svgElement
				.addCSSClass("toolBar")
				.setArea(sw, sw, xPad * 2 + size, tPad + (yPad + size) * buttCount + yPad)
				.setR(r);

			// Set attributes for all buttons
			let button: ToolButton;
			for (let i = 0; i < buttCount; i++) {
				button = new ToolButton(buttIds[i][0], buttIds[i][1]);
				button.x = sw + xPad;
				button.y = tPad + sw + yPad + (yPad + size) * i;
				button.width = size;
				button.height = size;
				button.r = r;
				buttons.push(button);

				// add to svg container and this
				container.addChild(button);
				this._children.push(button);
			}
		}



		protected _clickPos = new Vec2();
		protected _clickHandler(x: number, y: number, pressure: number) {
			if (super._clickHandler(x, y, pressure) === true) {
				this._clickPos.x = null;
			}
			else {
				this._clickPos.xy(x, y);
			}
			return true;
		}

		
		protected _dragHandler(x: number, y: number, pressure: number) {
			const flag = super._dragHandler(x, y, pressure);
			if (flag === false && this._clickPos.x !== null) {
				const moveX = x - this._clickPos.x;
				const moveY = y - this._clickPos.y;
				this._container.x += moveX;
				this._container.y += moveY;
			}
			return true;
		}
	}
}