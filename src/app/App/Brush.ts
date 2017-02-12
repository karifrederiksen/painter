///<reference path="../Rendering/Sprite.ts"/>

module TSPainter.App {
	export class Brush {
		protected _texture: Rendering.Texture;
		protected _color = new ColorConverter();
		protected _spacing = Settings.getValue(Settings.ID.BrushSpacing);
		protected _size = Settings.getValue(Settings.ID.BrushSize);


		constructor(texture: Rendering.Texture) {
			this.setTexture(texture);
			this.updateColor();
		}


		public updateColor() {
			this._color.hsva.hsva(
				Settings.getValue(Settings.ID.BrushHue), 
				Settings.getValue(Settings.ID.BrushSaturation), 
				Settings.getValue(Settings.ID.BrushValue),
				Settings.getValue(Settings.ID.BrushDensity));
			this._color.toRgba();
		}


		public setColorHsv(h: number, s: number, v: number) {
			const hsva = this._color.hsva;
			hsva.hsv(h, s, v);
			this._color.toRgba();
			return this;
		}


		public setColorHsvVec(hsv: Vec3) {
			const hsva = this._color.hsva;
			hsva.hsv(hsv.h, hsv.s, hsv.v);
			this._color.toRgba();
			return this;
		}

		public setTexture(t: Rendering.Texture) { 
			this._texture = t; 
			return this;
		}

		public setDensity(n: number) { 
			/* 
				Rescale alpha so that changes to it look more linear.

				Reason:
				In Photoshop the value for flow is directly tied to alpha without rescaling, and consequentially 
				you can make massive changes in the high end without making the Brush stroke look any different, 
				but if you make a small change in the low end, the stroke becomes much more transparent.

				I want to avoid this and instead have a setting that works similar to density in Paint Tool Sai,
				which is basically flow, but rescaled.
			*/
			n = clamp(n, .01, 1);
			n = n * .1 + expostep(n) * .9;
			
			this._color.setAlpha(n);
			return this;
		}

		public setSpacing(n: number) { 
			this._spacing = n; 
			return this;
		}

		public setSize(n: number) {
			this._size = n; 
			return this;
		}


		public getTexture()    { return this._texture; }

		public getScale()      { return this._texture.width / this._size; }

		public getSpacingPx()    { return this._spacing * this._size; }

		public getColorRgba()  { return this._color.rgba; }
	}
}