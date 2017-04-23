
import { IArithmetic } from "./IArithmetic";

export interface Color {
	toRgb(): Rgb;
	toHsv(): Hsv;
	toHex(): number;
	toGray(): number;
}

export interface ColorWithAlpha {
	toRgba(): Rgba;
	toHsva(): Hsva;
	toHex(): number;
}


export class Hsv implements Color, IArithmetic<Hsv> {
	public static readonly default = new Hsv(0, 0, 0);

	private constructor(
		private _h: number,
		private _s: number,
		private _v: number
	) { 
		Object.freeze(this);
	}

	public get h() { return this._h; }
	public get s() { return this._s; }
	public get v() { return this._v; }

	public static create(h: number, s: number, v: number) {
		if ([h,s,v].every(x => x === 0)) {
			return Hsv.default;
		}
		return new Hsv(h,s,v);
	}
	public default() {
		return Hsv.default;
	}
	public isDefault() {
		return this === Hsv.default;
	}

	public equals(rhs: Hsv) {
		return this._h === rhs._h
			&& this._s === rhs._s
			&& this._v === rhs._v;
	}

	public withH(n: number) { 
		return Hsv.create(n, this._s, this._v); 
	}
	public withS(n: number) { 
		return Hsv.create(this._h, n, this._v); 
	}
	public withV(n: number) { 
		return Hsv.create(this._h, this._s, n); 
	}
	

	public add(rhs: Hsv) {
		return Hsv.create(
			this._h + rhs._h,
			this._s + rhs._s,
			this._v + rhs._v
		);
	}
	public subtract(rhs: Hsv) {
		return Hsv.create(
			this._h - rhs._h,
			this._s - rhs._s,
			this._v - rhs._v
		);
	}
	public multiply(rhs: Hsv) {
		return Hsv.create(
			this._h * rhs._h,
			this._s * rhs._s,
			this._v * rhs._v
		);
	}
	public divide(rhs: Hsv) {
		return Hsv.create(
			this._h / rhs._h,
			this._s / rhs._s,
			this._v / rhs._v
		);
	}
	public addScalar(n: number) {
		return Hsv.create(
			this._h + n,
			this._s + n,
			this._v + n
		);
	}
	public subtractScalar(n: number) {
		return Hsv.create(
			this._h - n,
			this._s - n,
			this._v - n
		);
	}
	public multiplyScalar(n: number) {
		return Hsv.create(
			this._h * n,
			this._s * n,
			this._v * n
		);
	}
	public divideScalar(n: number) {
		return Hsv.create(
			this._h / n,
			this._s / n,
			this._v / n
		);
	}
	public powScalar(n: number) {
		return Hsv.create(
			this._h ** n,
			this._s ** n,
			this._v ** n
		);
	}




	public pow(n: number) {
		return Hsv.create(
			Math.pow(this._h, n),
			Math.pow(this._s, n),
			Math.pow(this._v, n)
		);
	}
	

	public toRgb() {
		const h = this._h;
		const s = this._s; 
		const v = this._v;
		const i = Math.floor(h * 6);
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

	public toHsv() { return this; }

	public toHex() { return this.toRgb().toHex(); }

	public toGray() { return this.toRgb().toGray(); }
}






export class Rgb implements Color, IArithmetic<Rgb>  {
	public static readonly default = new Rgb(0, 0, 0);
	
	private constructor(
		private _r: number,
		private _g: number,
		private _b: number
	) { 
		Object.freeze(this);
	}

	public get r() { return this._r; }
	public get g() { return this._g; }
	public get b() { return this._b; }

	public static create(r: number, g: number, b: number) { 
		if ([r,g,b].every(x => x === 0)) {
			return Rgb.default;
		}
		return new Rgb(r,g,b);
	}
	public default() {
		return Rgb.default;
	}
	public isDefault() {
		return this === Rgb.default;
	}

	public equals(rhs: Rgb) {
		return this._r === rhs._r
			&& this._g === rhs._g
			&& this._b === rhs._b;
	}

	public withR(n: number) { 
		return Rgb.create(n, this._g, this._b);
	}
	public withG(n: number) { 
		return Rgb.create(this._r, n, this._b);
	}
	public withB(n: number) { 
		return Rgb.create(this._r, this._g, n);
	}


	public add(rhs: Rgb) {
		return Rgb.create(
			this._r + rhs._r,
			this._g + rhs._g,
			this._b + rhs._b
		);
	}
	public subtract(rhs: Rgb) {
		return Rgb.create(
			this._r - rhs._r,
			this._g - rhs._g,
			this._b - rhs._b
		);
	}
	public multiply(rhs: Rgb) {
		return Rgb.create(
			this._r * rhs._r,
			this._g * rhs._g,
			this._b * rhs._b
		);
	}
	public divide(rhs: Rgb) {
		return Rgb.create(
			this._r / rhs._r,
			this._g / rhs._g,
			this._b / rhs._b
		);
	}
	public addScalar(n: number) {
		return Rgb.create(
			this._r + n,
			this._g + n,
			this._b + n
		);
	}
	public subtractScalar(n: number) {
		return Rgb.create(
			this._r - n,
			this._g - n,
			this._b - n
		);
	}
	public multiplyScalar(n: number) {
		return Rgb.create(
			this._r * n,
			this._g * n,
			this._b * n
		);
	}
	public divideScalar(n: number) {
		return Rgb.create(
			this._r / n,
			this._g / n,
			this._b / n
		);
	}
	public powScalar(n: number) {
		return Rgb.create(
			this._r ** n,
			this._g ** n,
			this._b ** n
		);
	}
	
	public round() {
		return Rgb.create(
			(this._r + .5) | 0,
			(this._g + .5) | 0,
			(this._b + .5) | 0
		);
	}

	public toRgb() { return this; }

	public toHsv() {
		const r = this._r;
		const g = this._g;
		const b = this._b;

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

	// do I need to floor the numbers before bitwise shifting?
	public toHex() {
		return (((this._r * 255) | 0) << 16)
			+ (((this._g * 255) | 0) << 8)
			+ ((this._b * 255) | 0)
	}

	public toGray() {
		const r = this._r;
		const g = this._g;
		const b = this._b;
		return Math.sqrt(
			.299 * r * r + 
			.587 * g * g +
			.114 * b * b
			);
	}
}







export class Hsva implements ColorWithAlpha, IArithmetic<Hsva> {
	public static readonly default = new Hsva(Hsv.create(0, 0, 0), 0);

	private constructor(
		private _hsv: Hsv,
		private _a: number
	) {
		Object.freeze(this);
	}

	public get hsv() { return this._hsv; }
	public get h() { return this._hsv.h; }
	public get s() { return this._hsv.s; }
	public get v() { return this._hsv.v; }
	public get a() { return this._a; }

	public static create(h: number, s: number, v: number, a: number) { 
		if ([h,s,v,a].every(x => x === 0)) {
			return Hsva.default;
		}
		return new Hsva(Hsv.create(h,s,v),a);
	}
	public static createWithHsv(hsv: Hsv, a: number) { 
		if (hsv === Hsva.default.hsv && a === 0) {
			return Hsva.default;
		}
		return new Hsva(hsv, a);
	}
	public default() {
		return Hsva.default;
	}
	public isDefault() {
		return this === Hsva.default;
	}

	public equals(rhs: Hsva) {
		return this._hsv.equals(rhs._hsv)
			&& this._a === rhs._a;
	}

	public withH(n: number) { 
		return Hsva.createWithHsv(this._hsv.withH(n), this._a); 
	}
	public withS(n: number) { 
		return Hsva.createWithHsv(this._hsv.withS(n), this._a); 
	}
	public withV(n: number) { 
		return Hsva.createWithHsv(this._hsv.withV(n), this._a); 
	}
	public withA(n: number) { 
		return Hsva.createWithHsv(this._hsv, n); 
	}

	public add(rhs: Hsva) {
		return Hsva.createWithHsv(
			this._hsv.add(rhs._hsv),
			this._a + rhs._a
		)
	}
	public subtract(rhs: Hsva) {
		return Hsva.createWithHsv(
			this._hsv.subtract(rhs._hsv),
			this._a - rhs._a
		)
	}
	public multiply(rhs: Hsva) {
		return Hsva.createWithHsv(
			this._hsv.multiply(rhs._hsv),
			this._a * rhs._a
		)
	}
	public divide(rhs: Hsva) {
		return Hsva.createWithHsv(
			this._hsv.divide(rhs._hsv),
			this._a / rhs._a
		)
	}
	public addScalar(n: number) {
		return Hsva.createWithHsv(
			this._hsv.addScalar(n),
			this._a + n
		)
	}
	public subtractScalar(n: number) {
		return Hsva.createWithHsv(
			this._hsv.subtractScalar(n),
			this._a - n
		)
	}
	public multiplyScalar(n: number) {
		return Hsva.createWithHsv(
			this._hsv.multiplyScalar(n),
			this._a * n
		)
	}
	public divideScalar(n: number) {
		return Hsva.createWithHsv(
			this._hsv.divideScalar(n),
			this._a / n
		)
	}
	public powScalar(n: number) {
		return Hsva.createWithHsv(
			this._hsv.powScalar(n),
			this._a ** n
		)
	}

	public toRgba = () => 
		Rgba.createWithRgb(
			this._hsv.toRgb(),
			this._a
		);

	public toHsva = () => this;

	public toHex = () => this.toRgba().toHex();

	public isZeroToOne() {
		function _isZeroToOne(n: number) {
			return n >= 0 && n <= 1;
		}
		return _isZeroToOne(this._hsv.h)
			&& _isZeroToOne(this._hsv.s)
			&& _isZeroToOne(this._hsv.v)
			&& _isZeroToOne(this._a);
	}
}





export class Rgba implements ColorWithAlpha, IArithmetic<Rgba> {
	public static readonly default = new Rgba(Rgb.create(0, 0, 0), 0);

	private constructor(
		private _rgb: Rgb,
		private _a: number
	) {
		Object.freeze(this);
	}
	public get rgb() { return this._rgb; }
	public get r() { return this._rgb.r; }
	public get g() { return this._rgb.g; }
	public get b() { return this._rgb.b; }
	public get a() { return this._a; }

	public static create(r: number, g: number, b: number, a: number) { 
		if ([r, g, b, a].every(x => x === 0)) {
			return Rgba.default;
		}
		return new Rgba(Rgb.create(r,g,b),a);
	}
	public static createWithRgb(rgb: Rgb, a: number){
		if (rgb === Rgba.default.rgb && a === 0) {
			return Rgba.default;
		}
		return new Rgba(rgb, a);
	}
	public default() {
		return Rgba.default;
	}
	public isDefault() {
		return this === Rgba.default;
	}

	public equals(rhs: Rgba) {
		return this._rgb.equals(rhs._rgb)
			&& this._a === rhs._a;
	}

	public withR(n: number) { 
		return Rgba.createWithRgb(this._rgb.withR(n), this._a); 
	}
	public withG(n: number) { 
		return Rgba.createWithRgb(this._rgb.withG(n), this._a); 
	} 
	public withB(n: number) { 
		return Rgba.createWithRgb(this._rgb.withB(n), this._a); 
	}
	public WithA(n: number) { 
		return Rgba.createWithRgb(this._rgb, n); 
	}

	public toRgba() { 
		return this;
	}

	public toHsva() {
		return Hsva.createWithHsv(
			this._rgb.toHsv(),
			this._a
		);
	}

	public toHex() {
		return (this._rgb.toHex() << 8)
			+ ((this._a + .5) | 0);
	}

	public add(rhs: Rgba) {
		return Rgba.createWithRgb(
			this._rgb.add(rhs._rgb),
			this._a + rhs._a
		);
	}

	public subtract(rhs: Rgba) {
		return Rgba.createWithRgb(
			this._rgb.subtract(rhs._rgb),
			this._a - rhs._a
		);
	}

	public multiply(rhs: Rgba) {
		return Rgba.createWithRgb(
			this._rgb.multiply(rhs._rgb),
			this._a * rhs._a
		);
	}

	public divide(rhs: Rgba) {
		return Rgba.createWithRgb(
			this._rgb.divide(rhs._rgb),
			this._a / rhs._a
		);
	}

	public addScalar(n: number) {
		return Rgba.createWithRgb(
			this._rgb.addScalar(n),
			this._a + n
		);
	}

	public subtractScalar(n: number) {
		return Rgba.createWithRgb(
			this._rgb.subtractScalar(n),
			this._a - n
		);
	}

	public multiplyScalar(n: number) {
		return Rgba.createWithRgb(
			this._rgb.multiplyScalar(n),
			this._a * n
		);
	}

	public divideScalar(n: number) {
		return Rgba.createWithRgb(
			this._rgb.divideScalar(n),
			this._a / n
		);
	}
	public powScalar(n: number) {
		return Rgba.createWithRgb(
			this._rgb.powScalar(n),
			this._a ** n
		)
	}
}


/*
	In the future I'm going to need to support Lab color format as well, and possibly more.
	I'll keep it simple for now, though.
*/
