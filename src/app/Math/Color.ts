module TSPainter {
	/*
		In the future I'm going to need to support Lab color format as well, and possibly more.
		I'll keep it simple for now, though.
	*/




	/*
		Object for containing both RGBA and HSVA values of a color. Useful in places where you
		regularly want to convert between the two formats.
	*/
	export class ColorConverter {
		public rgba = new Vec4();
		public hsva = new Vec4();

		public setAlpha(a: number) {
			this.rgba.a = a;
			this.hsva.a = a;
		}

		public toHsva() {
			ColorFuncs.rgba2hsva(this.rgba, this.hsva);
		}

		public toRgba() {
			ColorFuncs.hsva2rgba(this.hsva, this.rgba);
		}
	}






	/*
		Generic color functions
	*/
	module ColorFuncs {
		/* 
			Takes RGB values from the first input and puts the HSV equivalent into the second input
	
			Expected ranges
			rgb: [0 : 1] for all values
			hsv: [0 : 1] for all values
		*/
		export function rgb2hsv(rgb: Vec3, hsv: Vec3) {
			var r = rgb.r,
				g = rgb.g,
				b = rgb.b,
				h: number,
				max = Math.max(r, g, b),
				min = Math.min(r, g, b),
				d = max - min;
			hsv.s = (max == 0 ? 0 : d / max);
			hsv.v = max;

			switch (max) {
				case min:
					h = 0; break;
				case r:
					h = (g - b) / d + (g < b ? 6 : 0); break;
				case g:
					h = (b - r) / d + 2; break;
				case b:
					h = (r - g) / d + 4; break;
			}
			h /= 6;
			hsv.h = h;
		}


		/* 
			Takes RGBA values from the first input and puts the HSV equivalent into the second input
	
			Expected ranges
			rgba: [0 : 1] for all values
			hsva: [0 : 1] for all values
		*/
		export function rgba2hsva(rgba: Vec4, hsva: Vec4) {
			rgb2hsv(<any>rgba, <any>hsva);
			hsva.a = rgba.a;
		}


		/* 
			Takes HSV values from the first input and puts the RGB equivalent into the second input
	
			Expected ranges
			hsv: [0 : 1] for all values
			rgb: [0 : 1] for all values
		*/
		export function hsv2rgb(hsv: Vec3, rgb: Vec3) {
			var h = hsv.x, s = hsv.y, v = hsv.z,
				r: number, g: number, b: number,
				i: number, f: number, p: number,
				q: number, t: number;
			i = Math.floor(h * 6);
			f = h * 6 - i;
			p = v * (1 - s);
			q = v * (1 - f * s);
			t = v * (1 - (1 - f) * s);
			switch (i % 6) {
				case 0: r = v, g = t, b = p; break;
				case 1: r = q, g = v, b = p; break;
				case 2: r = p, g = v, b = t; break;
				case 3: r = p, g = q, b = v; break;
				case 4: r = t, g = p, b = v; break;
				case 5: r = v, g = p, b = q; break;
			}
			rgb.r = r;
			rgb.g = g;
			rgb.b = b;
		}


		/* 
			Takes HSVA values from the first input and puts the RGB equivalent into the second input
	
			Expected ranges
			hsva: [0 : 1] for all values
			rgba: [0 : 1] for all values
		*/
		export function hsva2rgba(hsva: Vec4, rgba: Vec4) {
			hsv2rgb(<any>hsva, <any>rgba);
			rgba.a = hsva.a;
		}


		/*
			Returns the base-10 representation of rgb hex color
		*/
		export function rgbToHex(rgb: Vec3): number {
			// do I need to floor the numbers before bitwise shifting?
			return (((rgb.r * 255) | 0) << 16)
				+ (((rgb.g * 255) | 0) << 8)
				+ ((rgb.b * 255) | 0)
		}


		/*
			Returns the base-10 representation of rgba hex color
		*/
		export function rgbaToHex(rgba: Vec4): number {
			return (((rgba.r * 255) | 0) << 24)
				+ (((rgba.g * 255) | 0) << 16)
				+ (((rgba.b * 255) | 0) << 8)
				+ ((rgba.a * 255) | 0)
		}
	}
}