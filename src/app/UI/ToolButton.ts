///<reference path="Generics/Button.ts"/>

module TSPainter.UI {
	export class ToolButton extends Button {
		protected _inUse = false;
		protected _tool: Tools;

		constructor(output: Events.ID, tool: Tools) {
			super(output);
			this._tool = tool;
			Settings.subscribe(Settings.ID.ToolId, this._handleToolChange);
		}

		protected _handleToolChange = (toolId: number) => {
			if (toolId === this._tool) {
				this.svgElement.addCSSClass("toolButtonActive");
				this._inUse = true;
			}
			else if (this._inUse === true) {
				this.svgElement.removeCSSClass("toolButtonActive");
				this._inUse = false;
			}
		}
	}
}