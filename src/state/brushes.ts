import { Hsluv } from "color";
import {
	brushId,
	ms,
	pct,
	type BrushId,
	type Ms,
	type Pct,
	type UpdateArgs,
} from "./base";
import { clamp } from "~/util";

export interface Brush {
	readonly id: BrushId;
	readonly eraser: boolean;
	readonly pigment: Hsluv;
	readonly size: number;
	readonly softness: Pct;
	readonly flow: Pct;
	readonly spacing: Pct;
	readonly delay: Ms;
}

export interface WithBrushes {
	readonly brushes: readonly Brush[];
	readonly currentBrushId: BrushId;
}

export interface DoSetColor {
	"brush:setColor"<S extends WithBrushes>(args: UpdateArgs<S>, color: Hsluv): S;
}

export interface DoSetSize {
	"brush:setSize"<S extends WithBrushes>(args: UpdateArgs<S>, size: number): S;
}

export interface DoSetSoftness {
	"brush:setSoftness"<S extends WithBrushes>(
		args: UpdateArgs<S>,
		softness: Pct,
	): S;
}

export interface DoSetFlow {
	"brush:setFlow"<S extends WithBrushes>(args: UpdateArgs<S>, flow: Pct): S;
}

export interface DoSetSpacing {
	"brush:setSpacing"<S extends WithBrushes>(
		args: UpdateArgs<S>,
		spacing: Pct,
	): S;
}

export interface DoSetDelay {
	"brush:setDelay"<S extends WithBrushes>(args: UpdateArgs<S>, delay: Ms): S;
}

export type DoBrushThings = DoSetColor &
	DoSetSize &
	DoSetSoftness &
	DoSetFlow &
	DoSetSpacing &
	DoSetDelay;

export const doSetColor: DoSetColor = {
	"brush:setColor"({ state }, pigment) {
		return updateCurrentBrush(state, (brush) => ({ ...brush, pigment }));
	},
};

export const doSetSize: DoSetSize = {
	"brush:setSize"({ state }, size) {
		return updateCurrentBrush(state, (brush) => ({
			...brush,
			size: clamp(size, pct(1), pct(500)),
		}));
	},
};

export const doSetSoftness: DoSetSoftness = {
	"brush:setSoftness"({ state }, softness) {
		return updateCurrentBrush(state, (brush) => ({
			...brush,
			softness: clamp(softness, pct(0), pct(1)),
		}));
	},
};

export const doSetFlow: DoSetFlow = {
	"brush:setFlow"({ state }, flow) {
		return updateCurrentBrush(state, (brush) => ({
			...brush,
			flow: clamp(flow, pct(0.01), pct(1)),
		}));
	},
};

export const doSetSpacing: DoSetSpacing = {
	"brush:setSpacing"({ state }, spacing) {
		return updateCurrentBrush(state, (brush) => ({
			...brush,
			spacing: clamp(spacing, pct(0.01), pct(1)),
		}));
	},
};

export const doSetDelay: DoSetDelay = {
	"brush:setDelay"({ state }, delay) {
		return updateCurrentBrush(state, (brush) => ({
			...brush,
			delay: clamp(delay, ms(0), ms(500)),
		}));
	},
};

export const doBrushThings: DoBrushThings = {
	...doSetColor,
	...doSetSize,
	...doSetSoftness,
	...doSetFlow,
	...doSetSpacing,
	...doSetDelay,
};

function updateCurrentBrush<S extends WithBrushes>(
	state: S,
	update: (brush: Brush) => Brush,
): S {
	const brush = state.brushes.find((x) => x.id === state.currentBrushId)!;
	const brushIdx = state.brushes.indexOf(brush);
	const brushes = [...state.brushes];
	brushes[brushIdx] = update(brush);
	return { ...state, brushes };
}

export function initBrushes(): WithBrushes {
	const black = new Hsluv(0, 0, 1);
	const currentBrushId = brushId(1);
	const currentBrush: Brush = {
		id: currentBrushId,
		delay: ms(0),
		eraser: false,
		flow: pct(0.05),
		size: 14,
		spacing: pct(0.05),
		softness: pct(0.95),
		pigment: black,
	};
	return {
		currentBrushId,
		brushes: [currentBrush],
	};
}
