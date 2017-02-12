///<reference path="UIObject.ts"/>

module TSPainter.UI {
	export abstract class Container extends BaseObject {
		protected _children: BaseObject[] = [];


		constructor(x: number, y: number, width: number, height: number) {
			super(x, y, width, height);
		}


		public addChild(child: BaseObject) {
			this._children.push(child);
			child.parent = this;
		}


		public removeChild(child: BaseObject) {
			const idx = this._children.indexOf(child);
			if (idx >= 0) {
				this._children.splice(idx, 1);
				child.parent = null;
			}
		}


		protected _clickHandler(x: number, y: number, pressure: number) {
			const children = this._children;
			x -= this._x;
			y -= this._y;
			for (let i = 0, ilen = children.length; i < ilen; i++) {
				if (children[i].interactable                   === true
				 && children[i].contains(x, y)                 === true
				 && children[i].click(x, y, pressure, false)   === true
				) {
					return true;
				}
			}
			return false;
		}


		protected _dragHandler(x: number, y: number, pressure: number) {
			const children = this._children;
			x -= this._x;
			y -= this._y;
			for (let i = 0, ilen = children.length; i < ilen; i++) {
				if (children[i].interactable            === true
				 && children[i].isActive                === true
				 && children[i].drag(x, y, pressure)    === true
				) {
					return true;
				}
			}
			return false;
		}


		protected _releaseHandler(x: number, y: number) {
			const children = this._children;
			x -= this._x;
			y -= this._y;
			for (let i = 0, ilen = children.length; i < ilen; i++) {
				if (children[i].interactable   === true
				 && children[i].isActive       === true
				 && children[i].release(x, y)  === true
				) {
					return true;
				}
			} 
			return false;
		}


		protected _hoverHandler(x: number, y: number) {
			const children = this._children;
			x -= this._x;
			y -= this._y;
			for (let i = 0, ilen = children.length; i < ilen; i++) {
				if (children[i].interactable    === true
				 && children[i].contains(x, y)  === true
				 && children[i].hover(x, y)     === true
				) {
					return true;
				}
			}
			return false;
		}
	}
}