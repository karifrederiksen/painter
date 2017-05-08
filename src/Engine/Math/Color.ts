
import { IArithmetic, Roundable } from "./Types";

export interface Color {
	toRgb(): Readonly<Rgb>;
	toHsv(): Readonly<Hsv>;
	toLab(): Readonly<Lab>;
	toHex(): number;
	toGray(): number;
}

export interface ColorWithAlpha {
	toRgba(): Readonly<Rgba>;
	toHsva(): Readonly<Hsva>;
	toHex(): number;
	toGray(): number;
}

export interface RgbArgs {
	r?: number;
	g?: number;
	b?: number;
}
export interface RgbaArgs {
	r?: number;
	g?: number;
	b?: number;
	a?: number;
}
export interface HsvArgs {
	h?: number;
	s?: number;
	v?: number;
}
export interface HsvaArgs {
	h?: number;
	s?: number;
	v?: number
	a?: number;
}
export interface LabArgs {
	l?: number;
	a?: number;
	b?: number;
}








export class Rgb implements Color, IArithmetic<Rgb>, Roundable<Rgb>  {
	public static readonly default = Object.freeze(new Rgb(0, 0, 0));
	
	private constructor(
		public readonly r: number,
		public readonly g: number,
		public readonly b: number
	) { }

	public static create(r: number, g: number, b: number) { 
		if ([r,g,b].every(x => x === 0)) {
			return Rgb.default;
		}
		return Object.freeze(new Rgb(r, g,b));
	}
	public default() {
		return Rgb.default;
	}

	public equals(rhs: Rgb) {
		return this.r === rhs.r
			&& this.g === rhs.g
			&& this.b === rhs.b;
	}

	public set(args: RgbArgs) {
		return Rgb.create(
			args.r != null ? args.r : this.r,
			args.g != null ? args.g : this.g,
			args.b != null ? args.b : this.b
		);
	}

	public toRgb() { return this; }

	public toHsv() {
		const { r, g, b } = this;

		const max = Math.max(r, g, b);
		const min = Math.min(r, g, b);
		const d = max - min;
		const s = (max === 0 ? 0 : d / max);
		const v = max;

		let h: number;
		switch (max) {
			case min:
				h = 0; 
				break;
			case r:
				h = (g - b) / d + (g < b ? 6 : 0); 
				break;
			case g:
				h = (b - r) / d + 2; 
				break;
			default:
				h = (r - g) / d + 4; 
				break;
		}
		h /= 6;
		return Hsv.create(h, s, v);
	}

	public toLab() {
		function _pivotRgb(n: number) {
			return (n > 0.04045) ? Math.pow((n + 0.055) / 1.055, 2.4) : n / 12.92
		}

		function _pivorXyz(n: number) {
			return (n > 0.008856451679035631) ? Math.cbrt(n) : (7.787 * n + 16) / 116;
		}
		let { r, g, b } = this;

		// actually converts to XYZ then to LAB

		r = _pivotRgb(r);
		g = _pivotRgb(g);
		b = _pivotRgb(b);

		let x = (r * 0.4124 + g * 0.3576 + b * 0.1805);
		let y = (r * 0.2126 + g * 0.7152 + b * 0.0722);
		let z = (r * 0.0193 + g * 0.1192 + b * 0.9505);

		x = _pivorXyz(x / 0.95047);
		y = _pivorXyz(y / 1.00000);
		z = _pivorXyz(z / 1.08883);

		return Lab.create(
			Math.max(0, 116 * y) - 16, 
			500 * (x - y), 
			200 * (y - z)
		);
	}

	// do I need to floor the numbers before bitwise shifting?
	public toHex() {
		return (((this.r * 255) | 0) << 16)
			+ (((this.g * 255) | 0) << 8)
			+ ((this.b * 255) | 0)
	}

	public toGray() {
		const { r, g, b } = this;
		return Math.sqrt(
			.299 * r * r + 
			.587 * g * g +
			.114 * b * b
			);
	}


	public add(rhs: Rgb) {
		return Rgb.create(
			this.r + rhs.r,
			this.g + rhs.g,
			this.b + rhs.b
		);
	}
	public subtract(rhs: Rgb) {
		return Rgb.create(
			this.r - rhs.r,
			this.g - rhs.g,
			this.b - rhs.b
		);
	}
	public multiply(rhs: Rgb) {
		return Rgb.create(
			this.r * rhs.r,
			this.g * rhs.g,
			this.b * rhs.b
		);
	}
	public divide(rhs: Rgb) {
		return Rgb.create(
			this.r / rhs.r,
			this.g / rhs.g,
			this.b / rhs.b
		);
	}
	public addScalar(n: number) {
		return Rgb.create(
			this.r + n,
			this.g + n,
			this.b + n
		);
	}
	public subtractScalar(n: number) {
		return Rgb.create(
			this.r - n,
			this.g - n,
			this.b - n
		);
	}
	public multiplyScalar(n: number) {
		return Rgb.create(
			this.r * n,
			this.g * n,
			this.b * n
		);
	}
	public divideScalar(n: number) {
		return Rgb.create(
			this.r / n,
			this.g / n,
			this.b / n
		);
	}
	public powScalar(n: number) {
		return Rgb.create(
			Math.exp(Math.log(this.r) * n),
			Math.exp(Math.log(this.g) * n),
			Math.exp(Math.log(this.b) * n)
		);
	}
	
	public round() {
		return Rgb.create(
			(this.r + .5) | 0,
			(this.g + .5) | 0,
			(this.b + .5) | 0
		);
	}
	
	public floor() {
		return Rgb.create(
			this.r | 0,
			this.g | 0,
			this.b | 0
		);
	}
	
	public ceil() {
		return Rgb.create(
			(this.r + 1) | 0,
			(this.g + 1) | 0,
			(this.b + 1) | 0
		);
	}
}





export class Rgba implements ColorWithAlpha, IArithmetic<Rgba>, Roundable<Rgba> {
	public static readonly default = Object.freeze(new Rgba(Rgb.create(0, 0, 0), 0));

	private constructor(
		public readonly rgb: Rgb,
		public readonly a: number
	) { }

	public get r() { return this.rgb.r; }
	public get g() { return this.rgb.g; }
	public get b() { return this.rgb.b; }

	public static create(r: number, g: number, b: number, a: number) { 
		if ([r, g, b, a].every(x => x === 0)) {
			return Rgba.default;
		}
		return Object.freeze(new Rgba(Rgb.create(r,g,b),a));
	}

	public static createWithRgb(rgb: Rgb, a: number){
		if (rgb === Rgba.default.rgb && a === 0) {
			return Rgba.default;
		}
		return Object.freeze(new Rgba(rgb, a));
	}
	public default() {
		return Rgba.default;
	}

	public equals(rhs: Rgba) {
		return this.rgb.equals(rhs.rgb)
			&& this.a === rhs.a;
	}

	public set(args: RgbaArgs) {
		return Rgba.create(
			args.r != null ? args.r : this.r,
			args.g != null ? args.g : this.g,
			args.b != null ? args.b : this.b,
			args.a != null ? args.a : this.a
		);
	}

	public setAlpha(alpha: number) {
		return Rgba.createWithRgb(
			this.rgb,
			alpha
		);
	}

	public toRgba() { 
		return this;
	}

	public toHsva() {
		return Hsva.createWithHsv(
			this.rgb.toHsv(),
			this.a
		);
	}

	public toHex() {
		return (this.rgb.toHex() << 8)
			+ ((this.a + .5) | 0);
	}

	public toGray() {
		return this.rgb.toGray() * this.a;
	}

	public add(rhs: Rgba) {
		return Rgba.createWithRgb(
			this.rgb.add(rhs.rgb),
			this.a + rhs.a
		);
	}

	public subtract(rhs: Rgba) {
		return Rgba.createWithRgb(
			this.rgb.subtract(rhs.rgb),
			this.a - rhs.a
		);
	}

	public multiply(rhs: Rgba) {
		return Rgba.createWithRgb(
			this.rgb.multiply(rhs.rgb),
			this.a * rhs.a
		);
	}

	public divide(rhs: Rgba) {
		return Rgba.createWithRgb(
			this.rgb.divide(rhs.rgb),
			this.a / rhs.a
		);
	}

	public addScalar(n: number) {
		return Rgba.createWithRgb(
			this.rgb.addScalar(n),
			this.a + n
		);
	}

	public subtractScalar(n: number) {
		return Rgba.createWithRgb(
			this.rgb.subtractScalar(n),
			this.a - n
		);
	}

	public multiplyScalar(n: number) {
		return Rgba.createWithRgb(
			this.rgb.multiplyScalar(n),
			this.a * n
		);
	}

	public divideScalar(n: number) {
		return Rgba.createWithRgb(
			this.rgb.divideScalar(n),
			this.a / n
		);
	}
	public powScalar(n: number) {
		return Rgba.createWithRgb(
			this.rgb.powScalar(n),
			Math.exp(Math.log(this.a) * n)
		)
	}

	public round() {
		return Rgba.createWithRgb(
			this.rgb.round(),
			(this.a + .5) | 0
		);
	}
	
	public floor() {
		return Rgba.createWithRgb(
			this.rgb.floor(),
			this.a | 0
		);
	}
	
	public ceil() {
		return Rgba.createWithRgb(
			this.rgb.ceil(),
			(this.a + 1) | 1
		);
	}
}




export class Hsv implements Color {
	public static readonly default = Object.freeze(new Hsv(0, 0, 0));

	private constructor(
		public readonly h: number,
		public readonly s: number,
		public readonly v: number
	) { }

	public static create(h: number, s: number, v: number) {
		if ([h,s,v].every(x => x === 0)) {
			return Hsv.default;
		}
		return Object.freeze(new Hsv(h,s,v));
	}

	public default() {
		return Hsv.default;
	}

	public equals(rhs: Hsv) {
		return this.h === rhs.h
			&& this.s === rhs.s
			&& this.v === rhs.v;
	}

	public set(args: HsvArgs) {
		return Hsv.create(
			args.h != null ? args.h : this.h,
			args.s != null ? args.s : this.s,
			args.v != null ? args.v : this.v
		);
	}

	public toRgb() {
		const { h, s, v } = this;
		const i = (h * 6) | 0;
		const f = h * 6 - i;
		const p = v * (1 - s);
		const q = v * (1 - f * s);
		const t = v * (1 - (1 - f) * s);

		let r: number;
		let g: number;
		let b: number;
		switch (i % 6) {
			case 0: 
				r = v, g = t, b = p; 
				break;
			case 1: 
				r = q, g = v, b = p; 
				break;
			case 2: 
				r = p, g = v, b = t; 
				break;
			case 3: 
				r = p, g = q, b = v; 
				break;
			case 4: 
				r = t, g = p, b = v; 
				break;
			default:
				r = v, g = p, b = q; 
				break;
		}
		return Rgb.create(r, g, b);
	}

	public toHsv() { 
		return this;
	}

	public toLab() { 
		return this.toRgb().toLab(); 
	}

	public toHex() { 
		return this.toRgb().toHex(); 
	}

	public toGray() { 
		return this.toRgb().toGray(); 
	}

	public isInRange(min: number, max: number) {
		function _isinRange(n: number) {
			return n >= min && n <= max;
		}
		return _isinRange(this.h)
			&& _isinRange(this.s)
			&& _isinRange(this.v);
	}
}






export class Hsva implements ColorWithAlpha {
	public static readonly default = Object.freeze(new Hsva(Hsv.create(0, 0, 0), 0));

	private constructor(
		public readonly hsv: Hsv,
		public readonly a: number
	) { }

	public get h() { return this.hsv.h; }
	public get s() { return this.hsv.s; }
	public get v() { return this.hsv.v; }

	public static create(h: number, s: number, v: number, a: number) { 
		if ([h,s,v,a].every(x => x === 0)) {
			return Hsva.default;
		}
		return Object.freeze(new Hsva(Hsv.create(h,s,v),a));
	}
	public static createWithHsv(hsv: Hsv, a: number) { 
		if (hsv === Hsva.default.hsv && a === 0) {
			return Hsva.default;
		}
		return Object.freeze(new Hsva(hsv, a));
	}
	public default() {
		return Hsva.default;
	}

	public equals(rhs: Hsva) {
		return this.hsv.equals(rhs.hsv)
			&& this.a === rhs.a;
	}

	public set(args: HsvaArgs) {
		return Hsva.create(
			args.h != null ? args.h : this.h,
			args.s != null ? args.s : this.s,
			args.v != null ? args.v : this.v,
			args.a != null ? args.a : this.a
		);
	}

	public setAlpha(alpha: number) {
		return Hsva.createWithHsv(
			this.hsv,
			alpha
		);
	}

	public toRgba() { 
		const rgba = Rgba.createWithRgb(
			this.hsv.toRgb(),
			this.a
		);
		return rgba;
	}

	public toHsva() { 
		return this;
	}

	public toHex() { 
		return this.toRgba().toHex(); 
	}

	public toGray() {
		return this.hsv.toGray() * this.a;
	}

	public isZeroToOne() {
		function _isZeroToOne(n: number) {
			return n >= 0 && n <= 1;
		}
		return _isZeroToOne(this.hsv.h)
			&& _isZeroToOne(this.hsv.s)
			&& _isZeroToOne(this.hsv.v)
			&& _isZeroToOne(this.a);
	}
}




export class Lab implements Color {
	public static readonly default = Object.freeze(new Lab(0, 0, 0));

	private constructor(
		public readonly l: number,
		public readonly a: number,
		public readonly b: number
	){}

	public static create(l: number, a: number, b: number) {
		return Object.freeze(new Lab(l, a, b));
	}

	public default() {
		return Hsva.default;
	}

	public set(args: LabArgs) {
		return Lab.create(
			args.l != null ? args.l : this.l,
			args.a != null ? args.a : this.a,
			args.b != null ? args.b : this.b,
		);
	}

	public toRgb() {
		function _pivotXyz(n: number) {
			const n3 = n * n * n;
			return (n3 > 0.008856451679035631) ? (n3) : ((n - 0.13793103448275862) / 7.787)
		}

		function _pivotRgb(n: number) {
			return (n > 0.0031308) ? (1.055 * Math.pow(n, 0.4166666666666667) - 0.055) : (12.92 * n)
		}

		// actually converts to XYZ then to RGB
		
		
		let y = (this.l + 16) * 116;
		let x = this.a / 500 + y
		let z = y - this.b / 200;

		x = 0.95047 * _pivotXyz(x);
		y = 1.00000 * _pivotXyz(y);
		z = 1.08883 * _pivotXyz(z);

		let r = x *  3.2406 + y * -1.5372 + z * -0.4986;
		let g = x * -0.9689 + y *  1.8758 + z *  0.0415;
		let b = x *  0.0557 + y * -0.2040 + z *  1.0570;

		r = _pivotRgb(r);
		g = _pivotRgb(g);
		b = _pivotRgb(b);


		return Rgb.create(r, g, b);
	}


	public toHsv() {
		return this.toRgb().toHsv();
	}

	public toLab() {
		return this;
	}

	public toHex() {
		return this.toRgb().toHex();
	}

	public toGray() {
		return this.toRgb().toGray();
	}
}