module TSPainter.UI {

	export type WrappedSVGCallback = (el: WrappedSVG, ev: MouseEvent) => any;

	export class WrappedSVG {
		protected static URI = "http://www.w3.org/2000/svg";

		protected _parent: WrappedSVG;
		protected _area = new Vec4();
		protected _cssClass: string;


		public element: SVGElement;

		constructor(element: SVGElement = null) {
			this.element = element || <SVGElement>document.createElementNS(WrappedSVG.URI, "svg");
		}

		
		public getX() { return this._area.x; }
		public getY() { return this._area.y; }
		public getWidth() { return this._area.width; } 
		public getHeight() { return this._area.height; }
		public getParent() { return this._parent; }

		public setX(n: number) {
			this.element.setAttribute("x", n.toString());
			this._area.x = n;
			return this;
		}


		public setY(n: number) {
			this.element.setAttribute("y", n.toString());
			this._area.y = n;
			return this;
		}


		public setWidth(n: number) {
			this.element.setAttribute("width", n.toString());
			this._area.width = n;
			return this;
		}


		public setHeight(n: number) {
			this.element.setAttribute("height", n.toString());
			this._area.height = n;
			return this;
		}


		public setArea(x: number, y: number, width: number, height: number) {
			this.element.setAttribute("x", x.toString());
			this.element.setAttribute("y", y.toString());
			this.element.setAttribute("width", width.toString());
			this.element.setAttribute("height", height.toString());
			this._area.xyzw(x, y, width, height);
			return this;
		}


		public addChild(child: WrappedSVG) {
			this.element.appendChild(child.element);
			child._parent = this;
			return this;
		}


		public removeCSSClass(cssClass: string) {
			this.element.classList.remove(cssClass);
			return this;
		}


		public addCSSClass(cssClass: string) {
			this.element.classList.add(cssClass);
			return this;
		}
	}





	export class WrappedSVGRect extends WrappedSVG {
		protected _r: number

		constructor() {
			super(<SVGElement>document.createElementNS(WrappedSVG.URI, "rect"));
		}


		public getR() { return this._r; }


		public setR(n: number) {
			this.element.setAttribute("rx", n.toString());
			this.element.setAttribute("ry", n.toString());
			this._r = n;
			return this;
		}
	}
}