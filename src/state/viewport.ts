import { clamp, v2, wrap } from "~/util";
import { pct, type Pct, type UpdateArgs } from "./base";

export interface ViewportTransforms {
	readonly zoom: Pct;
	readonly rotation: Pct;
	readonly offset: v2;
}

export interface WithViewportTransforms {
	readonly viewport: ViewportTransforms;
}

export interface DoTranslate {
	"viewport:translate"<S extends WithViewportTransforms>(
		args: UpdateArgs<S>,
		offset: v2,
	): S;
}

export interface DoRotate {
	"viewport:rotate"<S extends WithViewportTransforms>(
		args: UpdateArgs<S>,
		rotation: Pct,
	): S;
}

export interface DoZoom {
	"viewport:zoom"<S extends WithViewportTransforms>(
		args: UpdateArgs<S>,
		zoom: Pct,
	): S;
}

export type DoViewportThings = DoTranslate & DoRotate & DoZoom;

export const doTranslate: DoTranslate = {
	"viewport:translate"({ state }, offset) {
		return {
			...state,
			viewport: { ...state.viewport, offset: offset.clampNum(-1, 1) },
		};
	},
};

export const doRotate: DoRotate = {
	"viewport:rotate"({ state }, rotation) {
		return {
			...state,
			viewport: { ...state.viewport, rotation: wrap(rotation, pct(0), pct(1)) },
		};
	},
};

export const doZoom: DoZoom = {
	"viewport:zoom"({ state }, zoom) {
		return {
			...state,
			viewport: { ...state.viewport, zoom: clamp(zoom, pct(0.05), pct(3)) },
		};
	},
};

export const doViewportThings: DoViewportThings = {
	...doTranslate,
	...doRotate,
	...doZoom,
};

export function initViewport(): WithViewportTransforms {
	return {
		viewport: {
			offset: v2.xy(0, 0),
			rotation: pct(0),
			zoom: pct(1),
		},
	};
}
