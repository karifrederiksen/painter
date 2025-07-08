import { opaque, type Opaque } from "~/util";

export type Pct = Opaque<number, "Percent">;
export const pct = opaque.createConstructor<Pct>();

export type Ms = Opaque<number, "Ms">;
export const ms = opaque.createConstructor<Ms>();

export type Bitmap = Opaque<unknown, "Bitmap">;
export const bitmap = opaque.createConstructor<Bitmap>();

export type BrushId = Opaque<number, "BrushId">;
export const brushId = opaque.createConstructor<BrushId>();

export type LayerId = Opaque<number, "LayerId">;
export const layerId = opaque.createConstructor<LayerId>();

export interface Image {
	readonly width: number;
	readonly height: number;
	readonly data: Bitmap;
}

export interface Case<Tag extends Symbol, Val> {
	readonly tag: Tag;
	readonly val: Val;
}

export type UpdateArgs<S> = {
	readonly state: S;
	readonly effects: unknown[];
};
