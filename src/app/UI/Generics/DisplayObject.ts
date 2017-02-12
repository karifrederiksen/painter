///<reference path="Container.ts"/>

module TSPainter.UI {
	
	export class DisplayObject extends Container {
		public svgElement: WrappedSVGRect;

		constructor(x = 0, y = 0, width = 0, height = 0, svg: WrappedSVGRect = undefined) {
			super(x, y, width, height);
			this.svgElement = svg || new WrappedSVGRect();
			this.svgElement.setArea(x, y, width, height);
			this.description = "Generic DisplayObject";
		}

		public get x()      { return super.x; }
		public get y()      { return super.y; }
		public get width()  { return super.width; }
		public get height() { return super.height; }
		public get r()      { return this.svgElement.getR(); }

		public set x(n: number) {
			super.x = n;
			this.svgElement.setX(n);
		}

		public set y(n: number) {
			super.y = n;
			this.svgElement.setY(n);
		}

		public set width(n: number) {
			super.width = n;
			this.svgElement.setWidth(n);
		}

		public set height(n: number) {
			super.height = n;
			this.svgElement.setHeight(n);
		}

		public set r(n: number) { 
			this.svgElement.setR(n);
		}

		public addChild(child: DisplayObject | DisplayObjectContainer) {
			this.svgElement.addChild(child.svgElement);
			super.addChild(child);
		}
	}


	export class DisplayObjectContainer extends Container {
		public svgElement: WrappedSVG;


		constructor(svg: WrappedSVG) {
			super(svg.getX(), svg.getY(), svg.getHeight(), svg.getWidth());
			this.svgElement = svg;
			this.interactable = true;
			this.description = "Generic DisplayObjectContainer";
		}

		public get x()      { return super.x; }
		public get y()      { return super.y; }
		public get width()  { return super.width; }
		public get height() { return super.height; }

		public set x(n: number) {
			this._x = n;
			this.svgElement.setX(n);
		}

		public set y(n: number) {
			this._y = n;
			this.svgElement.setY(n);
		}

		public set width(n: number) {
			this._width = n;
			this.svgElement.setWidth(n);
		}

		public set height(n: number) {
			this._height = n;
			this.svgElement.setHeight(n);
		}

		public addChild(child: DisplayObject | DisplayObjectContainer) {
			this.svgElement.addChild(child.svgElement);
			super.addChild(child);
		}
	}
}