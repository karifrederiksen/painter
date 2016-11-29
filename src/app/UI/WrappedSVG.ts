module TSPainter {

	export type WrappedSVGCallback = (el: WrappedSVG, ev: MouseEvent) => any;

	export class WrappedSVG {
		protected static URI = "http://www.w3.org/2000/svg";

		protected _parent: WrappedSVG;
		protected _area = new Vec4();
		protected _cssClass: string;


		public element: SVGElement;

		constructor(parent: SVGElement, element = null) {
			this.element = element || document.createElementNS(WrappedSVG.URI, "svg");
			parent.appendChild(this.element);
		}

		
		public getX() { return this._area.x; }
		public getY() { return this._area.y; }
		public getWidth() { return this._area.width; }
		public getHeight() { return this._area.height; }

		protected readonly CSS_UNIT = "px";

		public setX(n: number) {
			this.element.setAttribute("x", n.toString() + this.CSS_UNIT);
			this._area.x = n;
			return this;
		}


		public setY(n: number) {
			this.element.setAttribute("y", n.toString() + this.CSS_UNIT);
			this._area.y = n;
			return this;
		}


		public setWidth(n: number) {
			this.element.setAttribute("width", n.toString() + this.CSS_UNIT);
			this._area.width = n;
			return this;
		}


		public setHeight(n: number) {
			this.element.setAttribute("height", n.toString() + this.CSS_UNIT);
			this._area.height = n;
			return this;
		}


		public setArea(x: number, y: number, width: number, height: number) {
			this.element.setAttribute("x", x.toString() + this.CSS_UNIT);
			this.element.setAttribute("y", y.toString() + this.CSS_UNIT);
			this.element.setAttribute("width", width.toString() + this.CSS_UNIT);
			this.element.setAttribute("height", height.toString() + this.CSS_UNIT);
			this._area.xyzw(x, y, width, height);
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



		public setOnClickCallback(c: WrappedSVGCallback) {
			this.element.addEventListener("mousedown", (ev: MouseEvent) => {
				c(this, ev);
			});
			return this;
		}


		public setOnMoveCallback(c: WrappedSVGCallback) {
			this.element.addEventListener("mousemove", (ev: MouseEvent) => {
				c(this, ev);
			});
			return this;
		}


		public setOnReleaseCallback(c: WrappedSVGCallback) {
			this.element.addEventListener("mouseup", (ev: MouseEvent) => {
				c(this, ev);
			});
			return this;
		}
	}





	export class WrappedSVGRect extends WrappedSVG {
		protected _r: number

		constructor(parent: WrappedSVG) {
			super(parent.element, document.createElementNS(WrappedSVG.URI, "rect"));
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