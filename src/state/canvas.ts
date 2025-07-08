import { v2 } from "~/util";
import { type WithViewportTransforms, initViewport } from "./viewport";
import { type WithMinimap, initMinimap } from "./minimap";
import { initRenderer, type WithRenderer } from "./renderer";
import {
	STATE_CANVAS_IDLE,
	type State,
	type StBuildingCanvas,
	type StCanvas,
} from "./states";
import { initLayers } from "./layers";
import { initBrushes } from "./brushes";
import { initPalette } from "./palette";
import type { UpdateArgs } from "./base";

export interface CanvasSettings {
	readonly name: string;
}

export interface CanvasBuilder {
	readonly nameValidation: string;
	readonly name: string;
	readonly widthValidation: string;
	readonly width: string;
	readonly heightValidation: string;
	readonly height: string;
}

export interface RendererState {
	readonly canvasSize: v2;
	// TODO: webgpu state and cached derived state
}

export interface WithCanvasBuilder {
	readonly canvasBuilder: CanvasBuilder;
}

export interface WithCanvas
	extends WithViewportTransforms,
		WithMinimap,
		WithRenderer {
	readonly canvas: CanvasSettings;
}

export interface DoSetName {
	"canvas:setName"(args: UpdateArgs<StBuildingCanvas>, name: string): State;
}

export interface DoSetWidth {
	"canvas:setWidth"(args: UpdateArgs<StBuildingCanvas>, width: string): State;
}

export interface DoSetHeight {
	"canvas:setHeight"(args: UpdateArgs<StBuildingCanvas>, height: string): State;
}

export interface DoCreateCanvas {
	"canvas:create"(args: UpdateArgs<StBuildingCanvas>): State;
}

export type DoCanvasBuilderThings = DoSetName &
	DoSetWidth &
	DoSetHeight &
	DoCreateCanvas;

export const doSetName: DoSetName = {
	"canvas:setName"({ state }, name) {
		const args = state.canvasBuilder;
		return {
			...state,
			canvasBuilder: {
				...args,
				name,
				nameValidation: "",
			},
		};
	},
};
export const doSetWidth: DoSetWidth = {
	"canvas:setWidth"({ state }, width) {
		const args = state.canvasBuilder;
		return {
			...state,
			canvasBuilder: {
				...args,
				width,
				widthValidation: canvasSizeCheck(width)
					? ""
					: canvasSizeFailure("width"),
			},
		};
	},
};
export const doSetHeight: DoSetHeight = {
	"canvas:setHeight"({ state }, height) {
		const args = state.canvasBuilder;
		return {
			...state,
			canvasBuilder: {
				...args,
				height,
				heightValidation: canvasSizeCheck(height)
					? ""
					: canvasSizeFailure("height"),
			},
		};
	},
};

export const doCreateCanvas: DoCreateCanvas = {
	"canvas:create"({ state }) {
		const args = state.canvasBuilder;

		const width = Number(args.width);
		const height = Number(args.height);
		const isWidthInvalid = Number.isNaN(width);
		const isHeightInvalid = Number.isNaN(height);
		if (isWidthInvalid || isHeightInvalid) {
			return {
				...state,
				canvasBuilder: {
					...args,
					widthValidation: isWidthInvalid ? "Invalid width" : "",
					heightValidation: isHeightInvalid ? "Invalid height" : "",
				},
			};
		}

		const canvasSize = v2.xy(width, height);
		const canvas: CanvasSettings = { name: args.name };
		const nextState: StCanvas = {
			...initViewport(),
			...initMinimap(),
			...initRenderer(canvasSize),
			...initBrushes(),
			...initPalette(),
			...initLayers(),
			tag: STATE_CANVAS_IDLE,
			canvas,
		};
		return nextState;
	},
};

export const doCanvasBuilderThings: DoCanvasBuilderThings = {
	...doSetName,
	...doSetWidth,
	...doSetHeight,
	...doCreateCanvas,
};

export function initCanvasBuilder(): WithCanvasBuilder {
	return {
		canvasBuilder: {
			nameValidation: "",
			name: "Painting",
			widthValidation: "",
			width: "",
			heightValidation: "",
			height: "",
		},
	};
}

function canvasSizeCheck(s: string): boolean {
	const n = Number(s);
	if (Number.isNaN(n)) return false;

	return n > 64 && n < 10_000;
}

function canvasSizeFailure(dimension: string) {
	return `Canvas ${dimension} must be between 64 and 10,000 pixels`;
}
