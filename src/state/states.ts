import { StreamSource, type Stream } from "./stream";
import type { UpdateArgs } from "./base";
import {
	doBrushThings,
	initBrushes,
	type DoBrushThings,
	type WithBrushes,
} from "./brushes";
import {
	doCanvasBuilderThings,
	initCanvasBuilder,
	type DoCanvasBuilderThings,
	type WithCanvas,
	type WithCanvasBuilder,
} from "./canvas";
import { doLayerThings, type DoLayerThings, type WithLayers } from "./layers";
import type { WithMinimap } from "./minimap";
import { initPalette, type WithPalette } from "./palette";
import type { WithRenderer } from "./renderer";
import {
	doViewportThings,
	type DoViewportThings,
	type WithViewportTransforms,
} from "./viewport";

export const STATE_BUILDING_CANVAS = Symbol("Building canvas");
export const STATE_CANVAS_IDLE = Symbol("Canvas idle");

export interface StGeneral extends WithBrushes, WithPalette {}

export interface StBuildingCanvas extends StGeneral, WithCanvasBuilder {
	readonly tag: typeof STATE_BUILDING_CANVAS;
}

export function isBuildingCanvas(st: State): st is StBuildingCanvas {
	return st.tag === STATE_BUILDING_CANVAS;
}

export function isCanvas(st: State): st is StCanvas {
	return st.tag === STATE_CANVAS_IDLE;
}

export interface StCanvas
	extends StGeneral,
		WithCanvas,
		WithLayers,
		WithViewportTransforms,
		WithMinimap,
		WithRenderer {
	readonly tag: typeof STATE_CANVAS_IDLE;
}

export type State = StBuildingCanvas | StCanvas;

export type Effect = unknown;

export type DoAny = DoCanvasBuilderThings &
	DoBrushThings &
	DoLayerThings &
	DoViewportThings;

const stBuildingCanvasHandlers: Partial<DoAny> = {
	...doCanvasBuilderThings,
	...doBrushThings,
};
const stCanvasHandlers: Partial<DoAny> = {
	...doBrushThings,
	...doLayerThings,
	...doViewportThings,
};

export type MsgArgs<T> = T extends (
	args: UpdateArgs<any>,
	...rest: infer R
) => unknown
	? R
	: never;

export type Message<MsgTag extends keyof Partial<DoAny>> = [
	MsgTag,
	...MsgArgs<DoAny[MsgTag]>,
];

function update(
	state: State,
	[tag, ...args]: Message<keyof DoAny>,
): [State, readonly Effect[]] {
	const effects: Effect[] = [];

	let handler: Function | undefined;
	switch (state.tag) {
		case STATE_BUILDING_CANVAS:
			handler = stBuildingCanvasHandlers[tag];
			break;
		case STATE_CANVAS_IDLE:
			handler = stCanvasHandlers[tag];
			break;
		default:
			state satisfies never;
			throw new Error(`Unexpected tag on state: ${JSON.stringify(state)}`);
	}

	if (typeof handler !== "function") {
		return [state, effects];
	}
	const updateArgs: UpdateArgs<State> = {
		state,
		effects,
	};
	const nextState = handler(updateArgs, ...args) as State;
	return [nextState, effects];
}

export type Send<Doer extends Partial<DoAny>> = <k extends keyof Doer>(
	tag: k,
	...x: MsgArgs<Doer[k]>
) => void;

export interface StateAtom {
	send: Send<DoAny>;
	stream: Stream<State>;
}

function initialState(): StBuildingCanvas {
	return {
		...initBrushes(),
		...initCanvasBuilder(),
		...initPalette(),
		tag: STATE_BUILDING_CANVAS,
	};
}

export function createStateAtom(): StateAtom {
	const queue: any[] = [];
	let animationFrameId: number | null = null;
	let state: State = initialState();
	const streamSource = new StreamSource<State>(state);

	const runUntilEmpty = () => {
		let next: any = undefined;
		while ((next = queue.shift())) {
			try {
				const [nextState, effects] = update(state, next);
				if (effects.length) {
					console.info("Effects", ...effects);
				}
				state = nextState;
			} catch (err) {
				console.error(err);
			}
		}

		animationFrameId = null;
		streamSource.next(state);
	};

	return {
		send(...args: any) {
			queue.push(args);
			if (!animationFrameId) {
				animationFrameId = requestAnimationFrame(runUntilEmpty);
			}
		},
		stream: streamSource.stream(),
	};
}
