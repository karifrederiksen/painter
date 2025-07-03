import { Vec2 } from "./vec2";

export * as Store from "./store";
export * as Decode from "./decode";
export * from "./maybe";
export * from "./result";
export * from "./vec2";
export * from "./vec3";
export * from "./vec4";
export * as FrameStream from "./frameStream";
export * as PerfTracker from "./perfTracker";
export * as CanvasPool from "./canvasPool";
export * as Debug from "./debug";
export * as Bloomfilter from "./bloomFilter";
export * as opaque from "./opaque";
export * from "./functions";
export type { Opaque, OpaqueBase, OpaqueBrand } from "./opaque";

export type Tagged<a, v = null> = { readonly tag: a; readonly val: v };

export function tagged<a>(tag: a, val: void): Tagged<a, null>;
export function tagged<a, v>(tag: a, val: v): Tagged<a, v>;
export function tagged<a, v = null>(tag: a, val: v): Tagged<a, v> {
	return { tag, val };
}

export class Lazy<a> {
	private __isSet = false;
	private __value: a | null = null;
	private readonly __fn: () => a;
	constructor(fn: () => a) {
		this.__fn = fn;
	}

	force(): a {
		if (!this.__isSet) {
			this.__value = this.__fn();
			this.__isSet = true;
		}
		return this.__value as a;
	}
}

export class SetOnce<a> {
	private __isSet = false;
	private __value: a | null = null;

	set(value: a): void {
		if (this.__isSet) throw new Error("Attempted to re-set a SetOnce");
		this.__value = value;
		this.__isSet = true;
	}

	get value(): a {
		if (!this.__isSet)
			throw new Error(
				"Attempted to get the value of a SetOnce before it was set",
			);
		return this.__value as a;
	}
}

export interface PushOnlyArray<a> extends ReadonlyArray<a> {
	push(item: a): unknown;
}

export enum ColorMode {
	Hsv = 1,
	Hsluv = 2,
}

export const Degrees = {
	fromNumber(x: number): Degrees {
		return x as any;
	},
	toNumber(x: Degrees): number {
		return x as any;
	},
};

export interface Degrees {
	__nominal: void;
}

export interface Turns {
	__nominal: void;
}

export const Turns = {
	fromNumber(x: number): Turns {
		return x as any;
	},
	toNumber(x: Turns): number {
		return x as any;
	},
};

export function turnsToDegrees(turns: Turns): Degrees {
	return Degrees.fromNumber(Turns.toNumber(turns) * 360);
}

export function turnsFromDegrees(degrees: Degrees): Turns {
	return Turns.fromNumber(Degrees.toNumber(degrees) / 360);
}

export function turn(turns: number, center: Vec2, point: Vec2): Vec2 {
	const radians = turns * 360 * (Math.PI / 180);
	const x =
		Math.cos(radians) * (point.x - center.x) -
		Math.sin(radians) * (point.y - center.y) +
		center.x;
	const y =
		Math.sin(radians) * (point.x - center.x) +
		Math.cos(radians) * (point.y - center.y) +
		center.y;
	return new Vec2(x, y);
}
