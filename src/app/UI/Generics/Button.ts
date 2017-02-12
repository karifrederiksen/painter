///<reference path="DisplayObject.ts"/>
///<reference path="WrappedSVG.ts"/>


module TSPainter.UI {

	export class Button extends DisplayObject {
		public outputEvent = Events.ID.None;

		constructor(output: Events.ID) {
			super(0, 0, 0, 0);
			this.outputEvent = output;
			this.svgElement.addCSSClass("toolButton");
			this.interactable = true;
			this.description = "Generic button";
		}

		protected _clickHandler(x: number, y: number, pressure: number) {
			Events.broadcast(this.outputEvent, undefined);
			return true;
		}
	}
}