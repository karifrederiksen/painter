module TSPainter.UI {

	export abstract class BaseObject {
		protected _x: number;
		protected _y: number;
		protected _width: number;
		protected _height: number;
		protected _visible = true;
		protected _wasInteractable = false;

		public description = "";
		public parent: Container = null;
		public interactable = false;
		public isActive = false;
		public svg: WrappedSVG;

		public get x()       { return this._x; }
		public get y()       { return this._y; }
		public get width()   { return this._width; }
		public get height()  { return this._height; }
		public get visible() { return this._visible; }

		public set x(n: number)      { this._x = n;}
		public set y(n: number)      { this._y = n;}
		public set width(n: number)  { this._width = n;}
		public set height(n: number) { this._height = n;}
		public set visible(flag: boolean) {
			if (flag === true && flag !== this._visible) {
				this.interactable = this._wasInteractable;
			}
			else {
				this.interactable = false;
				this._wasInteractable = this.interactable;
			}
			this._visible = flag;
		}



		constructor(x: number, y: number, width: number, height: number) {
			this._x = x;
			this._y = y;
			this._width = width;
			this._height = height;
		}


		public contains(x: number, y: number) {
			return this._x < x && x < (this._x + this._width)
				&& this._y < y && y < (this._y + this._height);
		}


		public click(x: number, y: number, pressure: number, onChildren: boolean) {
			const clicked = this._clickHandler(x, y, pressure);
			if (onChildren === true) {
				this.isActive = clicked;
			}
			else {
				this.isActive = true;
			}
			return clicked;
		}


		public drag(x: number, y: number, pressure: number) {
			return this._dragHandler(x, y, pressure);
		}


		public release(x: number, y: number) {
			const released = this._releaseHandler(x, y);
			this.isActive = false;
			return released;
		}


		public hover(x: number, y: number) {
			return this._hoverHandler(x, y);
		}


		// handlers can be extended
		protected _clickHandler(x: number, y: number, pressure: number) { return true; }
		protected _dragHandler(x: number, y: number, pressure: number)  { return true; }
		protected _releaseHandler(x: number, y: number)                 { return true; }
		protected _hoverHandler(x: number, y: number)                   { return true; }
	}
}